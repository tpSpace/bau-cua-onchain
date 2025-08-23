/**
 * Bau Cua Tom Ca Smart Contract Integration
 * Contract Address: 0xd303b0d0165b19f85727d32187a22e76f9f3f31895c7c23ce5f80e01d2c98cac
 */

import { gameSymbols, getContractIndex, contractIndicesToSymbolIds, type Bet } from "@/types/game";

// Contract constants
export const CONTRACT_CONFIG = {
  PACKAGE_ID: "0xd303b0d0165b19f85727d32187a22e76f9f3f31895c7c23ce5f80e01d2c98cac",
  BANK_ID: "0xca86008a4262ec597021dab6c070e76a04d423d4011240fe3cf5ca6e0657a735",
  RANDOM_ID: "0x8", // Global Sui Random object
  MODULE_NAME: "bau_cua",
} as const;

export interface ContractBet {
  symbol: number;
  amount: string; // In MIST
}

export interface GameResult {
  dice: number[];
  totalBet: string;
  winnings: string;
  player: string;
}

export interface PlayEventData {
  dice: number[];
  total_bet: string;
  winnings: string;
  player: string;
}

// Utility functions
export const MIST_PER_SUI = 1_000_000_000;

export function suiToMist(sui: number): string {
  return Math.floor(sui * MIST_PER_SUI).toString();
}

export function mistToSui(mist: string | number): number {
  return Number(mist) / MIST_PER_SUI;
}

export function prepareBetsForContract(bets: Bet[]): {
  symbols: number[];
  amounts: string[];
  totalAmount: string;
} {
  const symbols: number[] = [];
  const amounts: string[] = [];
  let totalAmount = 0;

  bets.forEach(bet => {
    const symbolIndex = getContractIndex(bet.symbolId);
    const amountInMist = bet.amount * MIST_PER_SUI;
    
    symbols.push(symbolIndex);
    amounts.push(amountInMist.toString());
    totalAmount += amountInMist;
  });

  return {
    symbols,
    amounts,
    totalAmount: totalAmount.toString(),
  };
}

export function parseGameResult(eventData: PlayEventData): GameResult {
  console.log('parseGameResult - input eventData:', eventData);
  
  // Handle potential different event data formats
  const dice = Array.isArray(eventData.dice) ? eventData.dice : [];
  const totalBet = eventData.total_bet || '0';
  const winnings = eventData.winnings || '0';
  const player = eventData.player || '';
  
  console.log('parseGameResult - parsed values:', { dice, totalBet, winnings, player });
  
  const result = {
    dice,
    totalBet: totalBet.toString(),
    winnings: winnings.toString(),
    player,
  };
  
  console.log('parseGameResult - final result:', result);
  return result;
}

// Convert contract dice results to symbol IDs
export function diceToSymbolIds(dice: number[]): string[] {
  return contractIndicesToSymbolIds(dice);
}
