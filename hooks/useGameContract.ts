"use client";

import { useState, useCallback } from 'react';
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getGameContract, ContractActivity } from '@/lib/game-contract';
import { GameResult, diceToSymbolIds } from '@/lib/contract';
import { type Bet } from '@/types/game';

export interface GameState {
  isPlaying: boolean;
  isLoadingCoins: boolean;
  isLoadingHistory: boolean;
  bankBalance: number | null;
  userCoins: Array<{
    objectId: string;
    balance: string;
    balanceInSui: number;
  }>;
  lastGameResult: GameResult | null;
  contractHistory: ContractActivity[];
  error: string | null;
}

export function useGameContract() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isLoadingCoins: false,
    isLoadingHistory: false,
    bankBalance: null,
    userCoins: [],
    lastGameResult: null,
    contractHistory: [],
    error: null,
  });

  const contract = getGameContract(client);

  // Load user's SUI coins
  const loadUserCoins = useCallback(async () => {
    if (!account?.address) return;

    setGameState(prev => ({ ...prev, isLoadingCoins: true, error: null }));
    
    try {
      const coins = await contract.getUserCoins(account.address);
      setGameState(prev => ({
        ...prev,
        userCoins: coins,
        isLoadingCoins: false,
      }));
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        error: `Failed to load coins: ${error}`,
        isLoadingCoins: false,
      }));
    }
  }, [account?.address, contract]);

  // Load bank balance
  const loadBankBalance = useCallback(async () => {
    try {
      const balance = await contract.getBankBalance();
      setGameState(prev => ({ ...prev, bankBalance: balance }));
    } catch (error) {
      console.error('Failed to load bank balance:', error);
    }
  }, [contract]);

  // Load contract activity history
  const loadContractHistory = useCallback(async (limit: number = 100) => {
    setGameState(prev => ({ ...prev, isLoadingHistory: true, error: null }));
    
    try {
      const history = await contract.getContractHistory(limit);
      console.log("useGameContract - loaded history:", history);
      console.log("useGameContract - history length:", history.length);
      setGameState(prev => ({
        ...prev,
        contractHistory: history,
        isLoadingHistory: false,
      }));
    } catch (error) {
      console.error('Failed to load contract history:', error);
      setGameState(prev => ({
        ...prev,
        error: `Failed to load contract history: ${error}`,
        isLoadingHistory: false,
      }));
    }
  }, [contract]);

  // Poll until a specific digest appears in history (handles indexer delay)
  const waitForHistoryDigest = useCallback(async (
    expectedDigest: string,
    options?: { limit?: number; maxAttempts?: number; intervalMs?: number }
  ) => {
    const limit = options?.limit ?? 100;
    const maxAttempts = options?.maxAttempts ?? 12; // ~18s at 1500ms
    const intervalMs = options?.intervalMs ?? 1500;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const history = await contract.getContractHistory(limit);
        // Update state each attempt so UI shows latest even if not found yet
        setGameState(prev => ({ ...prev, contractHistory: history, isLoadingHistory: false }));

        const found = history.some(item => item.digest === expectedDigest);
        if (found) return true;
      } catch (error) {
        console.warn('waitForHistoryDigest attempt failed:', error);
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    return false;
  }, [contract]);

  // Play the game
  const playGame = useCallback(async (bets: Bet[]) => {
    if (!account || bets.length === 0) {
      throw new Error('No account connected or no bets placed');
    }

    setGameState(prev => ({ ...prev, isPlaying: true, error: null }));

    try {
      // Estimate gas for the exact transaction we will execute
      const gasEstimate = await contract.estimateGasForPlay(account, bets);
      console.log('Estimated gas (SUI):', gasEstimate.estimatedGasSui, 'Recommended budget (MIST):', gasEstimate.recommendedBudgetMist.toString());

      // Calculate total bet
      const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);
      
      // Check if user can afford the bet + estimated gas + small buffer
      const canAfford = await contract.canAffordBet(account.address, totalBet + gasEstimate.estimatedGasSui + 0.01);
      if (!canAfford) {
        throw new Error(`Insufficient balance: need bet ${totalBet} SUI + gas ~${gasEstimate.estimatedGasSui.toFixed(4)} SUI`);
      }

      let result: any;
      let gameResult: any;

      // Always use single-transaction split-from-gas approach
      const playResult = await contract.playGameWithSplit(
        account,
        bets,
        signAndExecute
      );
      
      result = playResult.result;
      gameResult = playResult.gameResult;

      setGameState(prev => ({
        ...prev,
        lastGameResult: gameResult || null,
        isPlaying: false,
      }));

      // Refresh user coins, bank balance, and ensure history shows the new game
      await Promise.all([loadUserCoins(), loadBankBalance()]);
      // Show loading for history and poll until digest appears (indexer delay safe)
      setGameState(prev => ({ ...prev, isLoadingHistory: true }));
      await waitForHistoryDigest(result.digest, { limit: 100, maxAttempts: 12, intervalMs: 1500 });

      // After confirmation appears in history, do a final refresh of balances
      await Promise.all([loadUserCoins(), loadBankBalance()]);

      // Log the final game result for debugging
      console.log('Final game result being returned:', gameResult);

      return {
        success: true,
        gameResult,
        transactionDigest: result.digest,
        rawResult: result, // Include raw result for debugging
      };

    } catch (error: any) {
      setGameState(prev => ({
        ...prev,
        error: error.message || 'Failed to play game',
        isPlaying: false,
      }));
      
      throw error;
    }
  }, [account, contract, signAndExecute, loadUserCoins, loadBankBalance]);

  // Get user's total balance
  const getTotalBalance = useCallback((): number => {
    return gameState.userCoins.reduce((sum, coin) => sum + coin.balanceInSui, 0);
  }, [gameState.userCoins]);

  // Check if user can afford a bet amount
  const canAffordBet = useCallback((amount: number): boolean => {
    const totalBalance = getTotalBalance();
    return totalBalance >= (amount + 0.01); // Add gas buffer
  }, [getTotalBalance]);

  // Convert last game result to UI format
  const getLastGameUIResult = useCallback(() => {
    console.log('getLastGameUIResult - gameState.lastGameResult:', gameState.lastGameResult);
    
    if (!gameState.lastGameResult) return null;

    const result = {
      dice: diceToSymbolIds(gameState.lastGameResult.dice),
      winnings: parseFloat(gameState.lastGameResult.winnings) / 1_000_000_000,
      totalBet: parseFloat(gameState.lastGameResult.totalBet) / 1_000_000_000,
      rawDice: gameState.lastGameResult.dice, // Include raw numbers
    };
    
    console.log('getLastGameUIResult - converted result:', result);
    return result;
  }, [gameState.lastGameResult]);

  // Clear error
  const clearError = useCallback(() => {
    setGameState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    gameState,
    isConnected: !!account,
    userAddress: account?.address,
    totalBalance: getTotalBalance(),
    
    // Actions
    playGame,
    loadUserCoins,
    loadBankBalance,
    loadContractHistory,
    canAffordBet,
    clearError,
    
    // Computed values
    lastGameResult: getLastGameUIResult(),
  };
}
