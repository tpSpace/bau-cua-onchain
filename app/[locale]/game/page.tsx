"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useGameContract } from "@/hooks/useGameContract";
import { GameHeader } from "@/components/game/GameHeader";
import { MessageDisplay } from "@/components/game/MessageDisplay";
import { BettingBoard } from "@/components/game/BettingBoard";
import { DiceResults } from "@/components/game/DiceResults";
import { RandomnessDetails } from "@/components/game/RandomnessDetails";
import { GameAnalysis } from "@/components/game/GameAnalysis";
import { GameHistory } from "@/components/game/GameHistory";
import { gameSymbols } from "@/types/game";
import type {
  Bet,
  GameResult,
  RandomnessDetails as RandomnessDetailsType,
} from "@/types/game";

export default function GamePage() {
  const t = useTranslations();
  const {
    gameState,
    isConnected,
    userAddress,
    totalBalance,
    playGame,
    loadUserCoins,
    loadBankBalance,
    loadContractHistory,
    canAffordBet,
    clearError,
    lastGameResult,
  } = useGameContract();

  const [bets, setBets] = useState<Bet[]>([]);
  const [currentBet, setCurrentBet] = useState(0.1); // In SUI
  const [diceResults, setDiceResults] = useState<string[]>([]);
  const [randomnessDetails, setRandomnessDetails] =
    useState<RandomnessDetailsType>({});
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Load initial data when wallet connects
  useEffect(() => {
    if (isConnected && userAddress) {
      loadUserCoins();
      loadBankBalance();
      loadContractHistory();
    }
  }, [
    isConnected,
    userAddress,
    loadUserCoins,
    loadBankBalance,
    loadContractHistory,
  ]);

  // Handle game result
  useEffect(() => {
    if (lastGameResult) {
      setDiceResults(lastGameResult.dice);

      const newGameResult: GameResult = {
        dice: lastGameResult.dice,
        winnings: lastGameResult.winnings,
        timestamp: new Date(),
      };

      setGameHistory((prev) => [newGameResult, ...prev.slice(0, 9)]);

      // Extract detailed randomness information
      if (lastGameResult && (lastGameResult as any).rawDice) {
        const rawNumbers = (lastGameResult as any).rawDice;
        const symbols = lastGameResult.dice;
        const emojis = symbols.map(
          (symbol) => gameSymbols.find((s) => s.id === symbol)?.emoji || "🎲"
        );

        setRandomnessDetails({
          transactionDigest: undefined, // Will be set from the transaction result
          timestamp: new Date(),
          rawNumbers,
          convertedSymbols: symbols,
          emojis,
        });

        // Log dice result for debugging
        console.log("🎯 DICE RESULT:", {
          rawNumbers,
          symbols,
          emojis,
          winnings: lastGameResult.winnings,
        });
      }

      if (lastGameResult.winnings > 0) {
        setSuccessMessage(
          `You won ${lastGameResult.winnings.toFixed(4)} SUI! 🎉`
        );
      } else {
        setSuccessMessage("Better luck next time! 🎲");
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [lastGameResult]);

  const addBet = (symbolId: string) => {
    if (!isConnected) return;
    if (!canAffordBet(getTotalBet() + currentBet)) return;

    const existingBet = bets.find((bet) => bet.symbolId === symbolId);
    if (existingBet) {
      setBets(
        bets.map((bet) =>
          bet.symbolId === symbolId
            ? { ...bet, amount: bet.amount + currentBet }
            : bet
        )
      );
    } else {
      setBets([...bets, { symbolId, amount: currentBet }]);
    }
  };

  const clearBets = () => {
    setBets([]);
    clearError();
  };

  const rollDice = async () => {
    if (bets.length === 0 || !isConnected) return;

    try {
      clearError();
      setSuccessMessage("");

      // Convert bets to the format expected by the contract
      const contractBets = bets.map((bet) => ({
        symbolId: bet.symbolId,
        amount: bet.amount,
      }));

      const result = await playGame(contractBets);

      // Update randomness details with transaction digest
      if (result.transactionDigest) {
        setRandomnessDetails((prev) => ({
          ...prev,
          transactionDigest: result.transactionDigest,
        }));
      }

      setBets([]);
    } catch (error: any) {
      console.error("Game error:", error);
      // Error is handled by the hook
    }
  };

  const getTotalBet = () => bets.reduce((sum, bet) => sum + bet.amount, 0);
  const getBetAmount = (symbolId: string) =>
    bets.find((bet) => bet.symbolId === symbolId)?.amount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-800 to-yellow-700 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat" />
      </div>

      {/* Header */}
      <GameHeader
        isConnected={isConnected}
        totalBalance={totalBalance}
        bankBalance={gameState.bankBalance}
      />

      <div className="px-6 pb-6 relative z-10">
        {/* Game Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-red-300 to-pink-300 mb-4">
            {t("home.title")}
          </h1>
          <p className="text-yellow-100 text-lg">{t("game.subtitle")}</p>
        </motion.div>

        {/* Messages */}
        <MessageDisplay
          isConnected={isConnected}
          error={gameState.error}
          successMessage={successMessage}
          onClearError={clearError}
        />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Betting Board */}
          <div className="lg:col-span-2">
            <BettingBoard
              bets={bets}
              currentBet={currentBet}
              isConnected={isConnected}
              isPlaying={gameState.isPlaying}
              canAffordBet={canAffordBet}
              onAddBet={addBet}
              onSetCurrentBet={setCurrentBet}
              onClearBets={clearBets}
              onRollDice={rollDice}
              getTotalBet={getTotalBet}
              getBetAmount={getBetAmount}
            />
          </div>

          {/* Game Results & History */}
          <div className="space-y-6">
            <DiceResults
              diceResults={diceResults}
              isPlaying={gameState.isPlaying}
              gameHistory={gameHistory}
            />

            <RandomnessDetails randomnessDetails={randomnessDetails} />

            <GameAnalysis lastGameResult={lastGameResult} />

            <GameHistory
              gameHistory={gameHistory}
              gameState={gameState}
              onLoadContractHistory={loadContractHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
