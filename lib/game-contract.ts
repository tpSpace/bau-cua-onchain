"use client";

import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { WalletAccount } from "@mysten/wallet-standard";
import {
  CONTRACT_CONFIG,
  prepareBetsForContract,
  parseGameResult,
  GameResult,
  mistToSui,
  diceToSymbolIds,
} from "./contract";
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

  // Removed splitCoin and exact-coin play flow to simplify API

  /**
   * Play game with automatic coin splitting in single transaction
   */
  async playGameWithSplit(
    account: WalletAccount,
    bets: Bet[],
    signAndExecute: (input: { transaction: Transaction }) => Promise<any>
  ): Promise<{ result: any; gameResult?: GameResult }> {
    try {
      const { symbols, amounts, totalAmount } = prepareBetsForContract(bets);
      const totalAmountNum = Number(totalAmount);

      // Ensure totalAmount is valid
      if (totalAmountNum <= 0) {
        throw new Error("Total bet must be greater than 0");
      }

      // Check if user can afford the bet with sufficient gas buffer
      const totalBetInSui = totalAmountNum / 1_000_000_000;
      const gasBuffer = 0.05; // 0.05 SUI for gas
      const canAfford = await this.canAffordBet(account.address, totalBetInSui);

      if (!canAfford) {
        // Get actual balance for better error message
        const coins = await this.getUserCoins(account.address);
        const totalBalance = coins.reduce(
          (sum, coin) => sum + coin.balanceInSui,
          0
        );

        throw new Error(
          `Insufficient balance. You have ${totalBalance.toFixed(
            4
          )} SUI but need ${(totalBetInSui + gasBuffer).toFixed(
            4
          )} SUI (${totalBetInSui.toFixed(
            4
          )} SUI for bet plus ${gasBuffer} SUI for gas). Please reduce your bet or add more SUI.`
        );
      }

      console.log(
        `Starting playGameWithSplit with total bet: ${totalBetInSui} SUI (${totalAmount} MIST)`
      );

      const tx = new Transaction();

      // Split from gas coin to avoid coin conflicts
      console.log(`Splitting ${totalAmount} MIST from gas coin`);
      const [stakeCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(totalAmount)]);

      // Call the play function with the split coin
      tx.moveCall({
        target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::play`,
        arguments: [
          tx.object(CONTRACT_CONFIG.BANK_ID), // bank
          tx.object(CONTRACT_CONFIG.RANDOM_ID), // rnd
          tx.pure.vector("u8", symbols), // symbols
          tx.pure.vector("u64", amounts), // amounts
          stakeCoin, // stake (split coin)
        ],
      });

      // Execute transaction
      const result = await signAndExecute({ transaction: tx });

      console.log("PlayGameWithSplit - Transaction result:", result);
      console.log("PlayGameWithSplit - Events:", result.events);

      // Parse game result from events
      let gameResult: GameResult | undefined;
      if (result.events && result.events.length > 0) {
        console.log("Looking for PlayEvent in events...");

        const playEvent = result.events.find((event: any) => {
          console.log("Event type:", event.type);
          return (
            event.type?.includes("::bau_cua::PlayEvent") ||
            event.type?.includes("PlayEvent")
          );
        });

        console.log("Found PlayEvent:", playEvent);

        if (playEvent && playEvent.parsedJson) {
          console.log("Parsing event data:", playEvent.parsedJson);
          gameResult = parseGameResult(playEvent.parsedJson);
          console.log("Parsed game result:", gameResult);
        } else {
          console.log("No PlayEvent found or missing parsedJson");
        }
      } else {
        console.log("No events found in transaction result");
      }

      return { result, gameResult };
    } catch (error) {
      console.error("Error playing game with split:", error);
      throw error;
    }
  }

  /**
   * Estimate gas for a play transaction using a dry run.
   * Mirrors the single-transaction flow that splits stake from tx.gas and calls play.
   */
  async estimateGasForPlay(
    account: WalletAccount,
    bets: Bet[]
  ): Promise<{
    estimatedGasMist: number;
    estimatedGasSui: number;
    recommendedBudgetMist: number;
  }> {
    const { symbols, amounts, totalAmount } = prepareBetsForContract(bets);

    const tx = new Transaction();
    // Set sender to ensure realistic gas selection during dry run
    tx.setSenderIfNotSet(account.address);

    // Split stake from gas (mirrors playGame/playGameWithSplit current behavior)
    const [stakeCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(totalAmount)]);

    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::play`,
      arguments: [
        tx.object(CONTRACT_CONFIG.BANK_ID),
        tx.object(CONTRACT_CONFIG.RANDOM_ID),
        tx.pure.vector("u8", symbols),
        tx.pure.vector("u64", amounts),
        stakeCoin,
      ],
    });

    // Build and dry run
    const bytes = await tx.build({ client: this.client });
    const dry = await this.client.dryRunTransactionBlock({ transactionBlock: bytes });

    const gasUsed = dry.effects?.gasUsed as
      | { computationCost: string; storageCost: string; storageRebate: string }
      | undefined;

    if (!gasUsed) {
      // Fall back to a conservative minimum if unavailable
      const fallback = 8_000_000; // 0.008 SUI in MIST
      return {
        estimatedGasMist: fallback,
        estimatedGasSui: fallback / 1_000_000_000,
        recommendedBudgetMist: Math.ceil(fallback * 1.2),
      };
    }

    const computation = Number(gasUsed.computationCost ?? "0");
    const storage = Number(gasUsed.storageCost ?? "0");
    const rebate = Number(gasUsed.storageRebate ?? "0");
    // Actual fee charged = computation + storage - rebate
    let fee = computation + storage - rebate;
    if (fee < 0) fee = 0;

    // Add 20% headroom for recommended budget
    const recommended = Math.ceil(fee * 1.2);

    return {
      estimatedGasMist: fee,
      estimatedGasSui: fee / 1_000_000_000,
      recommendedBudgetMist: recommended,
    };
  }

  /**
   * Get available SUI coins for the user
   */
  async getUserCoins(address: string) {
    try {
      const coins = await this.client.getCoins({
        owner: address,
        coinType: "0x2::sui::SUI",
      });

      return coins.data.map((coin) => ({
        objectId: coin.coinObjectId,
        balance: coin.balance,
        balanceInSui: mistToSui(coin.balance),
      }));
    } catch (error) {
      console.error("Error fetching user coins:", error);
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
        options: { showContent: true },
      });

      if (
        bankObject.data &&
        bankObject.data.content &&
        "fields" in bankObject.data.content
      ) {
        const fields = bankObject.data.content.fields as any;
        const treasuryBalance = fields.treasury?.fields?.balance;

        if (treasuryBalance) {
          return mistToSui(treasuryBalance);
        }
      }

      return 0;
    } catch (error) {
      console.error("Error fetching bank balance:", error);
      return 0;
    }
  }

  /**
   * Get contract activity history - all play transactions
   */
  async getContractHistory(limit: number = 100): Promise<ContractActivity[]> {
    try {
      console.log(
        "Fetching contract history for package:",
        CONTRACT_CONFIG.PACKAGE_ID
      );

      // Query transactions that called the play function
      const response = await this.client.queryTransactionBlocks({
        filter: {
          MoveFunction: {
            package: CONTRACT_CONFIG.PACKAGE_ID,
            module: CONTRACT_CONFIG.MODULE_NAME,
            function: "play",
          },
        },
        options: {
          showEvents: true,
          showEffects: true,
          showInput: true,
          showBalanceChanges: true,
        },
        order: "descending",
        limit,
      });

      console.log("Raw transaction response:", response);

      const activities: ContractActivity[] = [];

      for (const tx of response.data) {
        try {
          const activity = this.parseTransactionToActivity(tx);
          if (activity) {
            activities.push(activity);
          }
        } catch (error) {
          console.error("Error parsing transaction:", tx.digest, error);
        }
      }

      console.log("Parsed activities:", activities);
      return activities;
    } catch (error) {
      console.error("Error fetching contract history:", error);
      return [];
    }
  }

  /**
   * Parse a transaction block to extract game activity data
   */
  private parseTransactionToActivity(tx: any): ContractActivity | null {
    try {
      const digest = tx.digest;
      const timestamp = tx.timestampMs
        ? new Date(parseInt(tx.timestampMs))
        : new Date();

      // Extract gas data
      const gasUsed = tx.effects?.gasUsed?.computationCost || "0";
      const gasFee = tx.effects?.gasUsed?.storageCost || "0";
      const totalGas = (parseInt(gasUsed) + parseInt(gasFee)).toString();

      // Find PlayEvent
      let gameData: any = null;
      if (tx.events) {
        const playEvent = tx.events.find(
          (event: any) =>
            event.type?.includes("::bau_cua::PlayEvent") ||
            event.type?.includes("PlayEvent")
        );

        if (playEvent && playEvent.parsedJson) {
          gameData = playEvent.parsedJson;
        }
      }

      if (!gameData) {
        console.log("No PlayEvent found in transaction:", digest);
        return null;
      }

      // Extract player address
      let player = gameData.player || "";
      if (!player && tx.transaction?.data?.sender) {
        player = tx.transaction.data.sender;
      }

      // Parse game results
      const dice = gameData.dice || [];
      const totalBet = gameData.total_bet || "0";
      const winnings = gameData.winnings || "0";

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
        },
      };
    } catch (error) {
      console.error("Error parsing transaction to activity:", error);
      return null;
    }
  }

  /**
   * Check if user has enough balance for the bet
   */
  async canAffordBet(address: string, totalBetInSui: number): Promise<boolean> {
    try {
      const coins = await this.getUserCoins(address);
      const totalBalance = coins.reduce(
        (sum, coin) => sum + coin.balanceInSui,
        0
      );

      // Increase gas buffer to 0.05 SUI for safety margin
      // Sui transactions can need more gas depending on complexity and network congestion
      const gasBuffer = 0.05;
      const requiredBalance = totalBetInSui + gasBuffer;

      console.log(
        `Balance check: Total ${totalBalance} SUI, Need ${totalBetInSui} SUI for bet + ${gasBuffer} SUI for gas`
      );

      return totalBalance >= requiredBalance;
    } catch (error) {
      console.error("Error checking affordability:", error);
      return false;
    }
  }

  /**
   * Get maximum safe betting amount for user
   */
  async getMaxSafeBetAmount(address: string): Promise<{
    maxBetInSui: number;
    totalBalanceInSui: number;
    gasBufferInSui: number;
  }> {
    try {
      const coins = await this.getUserCoins(address);
      const totalBalance = coins.reduce(
        (sum, coin) => sum + coin.balanceInSui,
        0
      );

      // Keep gas buffer for transaction
      const gasBuffer = 0.008; // 0.008 SUI

      // Max bet is total balance minus gas buffer (or zero if balance < buffer)
      const maxBet = Math.max(0, totalBalance - gasBuffer);

      return {
        maxBetInSui: maxBet,
        totalBalanceInSui: totalBalance,
        gasBufferInSui: gasBuffer,
      };
    } catch (error) {
      console.error("Error calculating max bet amount:", error);
      return { maxBetInSui: 0, totalBalanceInSui: 0, gasBufferInSui: 0.05 };
    }
  }

  /**
   * Find the best coin to use for betting
   */
  // Removed best-coin selection as we always split from gas inside the tx
}

// Singleton instance
let gameContractInstance: GameContract | null = null;

export function getGameContract(client: SuiClient): GameContract {
  if (!gameContractInstance) {
    gameContractInstance = new GameContract(client);
  }
  return gameContractInstance;
}
