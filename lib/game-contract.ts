"use client";

import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { WalletAccount } from "@mysten/wallet-standard";
import { CONTRACT_CONFIG, prepareBetsForContract, parseGameResult, GameResult, mistToSui, diceToSymbolIds } from "./contract";
import { type Bet } from "@/types/game";

export interface ContractActivity {
  digest: string;
  timestamp: Date;
  player: string;
  dice: string[];
  totalBet: number;
  winnings: number;
  isWin: boolean;
  gasUsed: number;
  rawGasData: {
    computationCost: string;
    storageCost: string;
    totalCost: string;
  };
}

export class GameContract {
  private client: SuiClient;

  constructor(client: SuiClient) {
    this.client = client;
  }

  /**
   * Split a coin to get exact betting amount
   */
  async splitCoin(
    account: WalletAccount,
    coinId: string,
    amount: string,
    signAndExecute: (input: { transaction: Transaction }) => Promise<any>
  ) {
    const tx = new Transaction();
    
    // Use the standard coin split function
    const [splitCoin] = tx.splitCoins(tx.object(coinId), [amount]);
    
    // Transfer the split coin to the same address (to get object change events)
    tx.transferObjects([splitCoin], account.address);

    const result = await signAndExecute({ transaction: tx });
    console.log('Split coin transaction result:', result);
    return result;
  }

  /**
   * Play the Bau Cua game
   */
  async playGame(
    account: WalletAccount,
    bets: Bet[],
    coinId: string,
    signAndExecute: (input: { transaction: Transaction }) => Promise<any>
  ): Promise<{ result: any; gameResult?: GameResult }> {
    try {
      const { symbols, amounts, totalAmount } = prepareBetsForContract(bets);
      
      const tx = new Transaction();
      
      // Call the play function
      tx.moveCall({
        target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::play`,
        arguments: [
          tx.object(CONTRACT_CONFIG.BANK_ID),      // bank
          tx.object(CONTRACT_CONFIG.RANDOM_ID),    // rnd  
          tx.pure.vector('u8', symbols),           // symbols
          tx.pure.vector('u64', amounts),          // amounts
          tx.object(coinId),                       // stake
        ],
      });

      // Execute transaction
      const result = await signAndExecute({ transaction: tx });
      
      console.log('PlayGame - Transaction result:', result);
      console.log('PlayGame - Events:', result.events);
      
      // Parse game result from events
      let gameResult: GameResult | undefined;
      if (result.events && result.events.length > 0) {
        console.log('Looking for PlayEvent in events...');
        
        const playEvent = result.events.find((event: any) => {
          console.log('Event type:', event.type);
          return event.type?.includes('::bau_cua::PlayEvent') || 
                 event.type?.includes('PlayEvent');
        });
        
        console.log('Found PlayEvent:', playEvent);
        
        if (playEvent && playEvent.parsedJson) {
          console.log('Parsing event data:', playEvent.parsedJson);
          gameResult = parseGameResult(playEvent.parsedJson);
          console.log('Parsed game result:', gameResult);
        } else {
          console.log('No PlayEvent found or missing parsedJson');
        }
      } else {
        console.log('No events found in transaction result');
      }

      return { result, gameResult };
    } catch (error) {
      console.error('Error playing game:', error);
      throw error;
    }
  }

  /**
   * Play game with automatic coin splitting in single transaction
   */
  async playGameWithSplit(
    account: WalletAccount,
    bets: Bet[],
    coinId: string,
    signAndExecute: (input: { transaction: Transaction }) => Promise<any>
  ): Promise<{ result: any; gameResult?: GameResult }> {
    try {
      const { symbols, amounts, totalAmount } = prepareBetsForContract(bets);
      
      const tx = new Transaction();
      
      // Split the coin to get exact amount in same transaction
      const [stakeCoin] = tx.splitCoins(tx.object(coinId), [totalAmount]);
      
      // Call the play function with the split coin
      tx.moveCall({
        target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::play`,
        arguments: [
          tx.object(CONTRACT_CONFIG.BANK_ID),      // bank
          tx.object(CONTRACT_CONFIG.RANDOM_ID),    // rnd  
          tx.pure.vector('u8', symbols),           // symbols
          tx.pure.vector('u64', amounts),          // amounts
          stakeCoin,                               // stake (split coin)
        ],
      });

      // Execute transaction
      const result = await signAndExecute({ transaction: tx });
      
      console.log('PlayGameWithSplit - Transaction result:', result);
      console.log('PlayGameWithSplit - Events:', result.events);
      
      // Parse game result from events
      let gameResult: GameResult | undefined;
      if (result.events && result.events.length > 0) {
        console.log('Looking for PlayEvent in events...');
        
        const playEvent = result.events.find((event: any) => {
          console.log('Event type:', event.type);
          return event.type?.includes('::bau_cua::PlayEvent') || 
                 event.type?.includes('PlayEvent');
        });
        
        console.log('Found PlayEvent:', playEvent);
        
        if (playEvent && playEvent.parsedJson) {
          console.log('Parsing event data:', playEvent.parsedJson);
          gameResult = parseGameResult(playEvent.parsedJson);
          console.log('Parsed game result:', gameResult);
        } else {
          console.log('No PlayEvent found or missing parsedJson');
        }
      } else {
        console.log('No events found in transaction result');
      }

      return { result, gameResult };
    } catch (error) {
      console.error('Error playing game with split:', error);
      throw error;
    }
  }

  /**
   * Get available SUI coins for the user
   */
  async getUserCoins(address: string) {
    try {
      const coins = await this.client.getCoins({
        owner: address,
        coinType: '0x2::sui::SUI',
      });

      return coins.data.map(coin => ({
        objectId: coin.coinObjectId,
        balance: coin.balance,
        balanceInSui: mistToSui(coin.balance),
      }));
    } catch (error) {
      console.error('Error fetching user coins:', error);
      return [];
    }
  }

  /**
   * Get bank treasury balance
   */
  async getBankBalance(): Promise<number> {
    try {
      const bankObject = await this.client.getObject({
        id: CONTRACT_CONFIG.BANK_ID,
        options: { showContent: true }
      });

      if (bankObject.data && bankObject.data.content && 'fields' in bankObject.data.content) {
        const fields = bankObject.data.content.fields as any;
        const treasuryBalance = fields.treasury?.fields?.balance;
        
        if (treasuryBalance) {
          return mistToSui(treasuryBalance);
        }
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching bank balance:', error);
      return 0;
    }
  }

  /**
   * Get contract activity history - all play transactions
   */
  async getContractHistory(limit: number = 100): Promise<ContractActivity[]> {
    try {
      console.log('Fetching contract history for package:', CONTRACT_CONFIG.PACKAGE_ID);
      
      // Query transactions that called the play function
      const response = await this.client.queryTransactionBlocks({
        filter: {
          MoveFunction: {
            package: CONTRACT_CONFIG.PACKAGE_ID,
            module: CONTRACT_CONFIG.MODULE_NAME,
            function: 'play'
          }
        },
        options: {
          showEvents: true,
          showEffects: true,
          showInput: true,
          showBalanceChanges: true,
        },
        order: 'descending',
        limit,
      });

      console.log('Raw transaction response:', response);

      const activities: ContractActivity[] = [];

      for (const tx of response.data) {
        try {
          const activity = this.parseTransactionToActivity(tx);
          if (activity) {
            activities.push(activity);
          }
        } catch (error) {
          console.error('Error parsing transaction:', tx.digest, error);
        }
      }

      console.log('Parsed activities:', activities);
      return activities;
    } catch (error) {
      console.error('Error fetching contract history:', error);
      return [];
    }
  }

  /**
   * Parse a transaction block to extract game activity data
   */
  private parseTransactionToActivity(tx: any): ContractActivity | null {
    try {
      const digest = tx.digest;
      const timestamp = tx.timestampMs ? new Date(parseInt(tx.timestampMs)) : new Date();
      
      // Extract gas data
      const gasUsed = tx.effects?.gasUsed?.computationCost || '0';
      const gasFee = tx.effects?.gasUsed?.storageCost || '0';
      const totalGas = (parseInt(gasUsed) + parseInt(gasFee)).toString();

      // Find PlayEvent
      let gameData: any = null;
      if (tx.events) {
        const playEvent = tx.events.find((event: any) => 
          event.type?.includes('::bau_cua::PlayEvent') || 
          event.type?.includes('PlayEvent')
        );
        
        if (playEvent && playEvent.parsedJson) {
          gameData = playEvent.parsedJson;
        }
      }

      if (!gameData) {
        console.log('No PlayEvent found in transaction:', digest);
        return null;
      }

      // Extract player address
      let player = gameData.player || '';
      if (!player && tx.transaction?.data?.sender) {
        player = tx.transaction.data.sender;
      }

      // Parse game results
      const dice = gameData.dice || [];
      const totalBet = gameData.total_bet || '0';
      const winnings = gameData.winnings || '0';
      
      const totalBetSui = mistToSui(totalBet);
      const winningsSui = mistToSui(winnings);
      const isWin = winningsSui > 0;

      return {
        digest,
        timestamp,
        player,
        dice: diceToSymbolIds(dice),
        totalBet: totalBetSui,
        winnings: winningsSui,
        isWin,
        gasUsed: mistToSui(totalGas),
        rawGasData: {
          computationCost: gasUsed,
          storageCost: gasFee,
          totalCost: totalGas,
        }
      };
    } catch (error) {
      console.error('Error parsing transaction to activity:', error);
      return null;
    }
  }

  /**
   * Check if user has enough balance for the bet
   */
  async canAffordBet(address: string, totalBetInSui: number): Promise<boolean> {
    try {
      const coins = await this.getUserCoins(address);
      const totalBalance = coins.reduce((sum, coin) => sum + coin.balanceInSui, 0);
      
      // Need extra for gas fees
      const requiredBalance = totalBetInSui + 0.01; // Add 0.01 SUI for gas
      
      return totalBalance >= requiredBalance;
    } catch (error) {
      console.error('Error checking affordability:', error);
      return false;
    }
  }

  /**
   * Find the best coin to use for betting
   */
  async findBestCoinForBet(address: string, totalBetInSui: number): Promise<{
    needsSplit: boolean;
    coinId: string;
    splitAmount?: string;
  } | null> {
    try {
      const coins = await this.getUserCoins(address);
      const totalBetInMist = totalBetInSui * 1_000_000_000;
      
      // Look for exact match first
      const exactMatch = coins.find(coin => 
        Number(coin.balance) === totalBetInMist
      );
      
      if (exactMatch) {
        return {
          needsSplit: false,
          coinId: exactMatch.objectId,
        };
      }
      
      // Look for a coin that needs splitting
      const largerCoin = coins.find(coin => 
        Number(coin.balance) > totalBetInMist
      );
      
      if (largerCoin) {
        return {
          needsSplit: true,
          coinId: largerCoin.objectId,
          splitAmount: totalBetInMist.toString(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error finding best coin:', error);
      return null;
    }
  }
}

// Singleton instance
let gameContractInstance: GameContract | null = null;

export function getGameContract(client: SuiClient): GameContract {
  if (!gameContractInstance) {
    gameContractInstance = new GameContract(client);
  }
  return gameContractInstance;
}
