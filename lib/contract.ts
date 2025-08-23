/**
 * Bau Cua Tom Ca Smart Contract Integration
 * Contract Address: 0xd303b0d0165b19f85727d32187a22e76f9f3f31895c7c23ce5f80e01d2c98cac
 */

// Contract constants
export const CONTRACT_CONFIG = {
  PACKAGE_ID: "0xd303b0d0165b19f85727d32187a22e76f9f3f31895c7c23ce5f80e01d2c98cac",
  BANK_ID: "0xca86008a4262ec597021dab6c070e76a04d423d4011240fe3cf5ca6e0657a735",
  RANDOM_ID: "0x8", // Global Sui Random object
  MODULE_NAME: "bau_cua",
} as const;

// Game symbols mapping (0-5 in smart contract)
export const SYMBOL_MAP = {
  bau: 0,   // Gourd 🥒
  cua: 4,   // Crab 🦀  
  tom: 1,   // Shrimp 🦐
  ca: 2,    // Fish 🐟
  ga: 3,    // Rooster 🐓
  nai: 5,   // Deer 🦌
} as const;

// Reverse mapping for contract results
export const SYMBOL_ID_MAP = {
  0: "bau",
  1: "tom", 
  2: "ca",
  3: "ga",
  4: "cua",
  5: "nai",
} as const;

// Type definitions
export interface BetData {
  symbolId: string;
  amount: number;
}

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

export function prepareBetsForContract(bets: BetData[]): {
  symbols: number[];
  amounts: string[];
  totalAmount: string;
} {
  const symbols: number[] = [];
  const amounts: string[] = [];
  let totalAmount = 0;

  bets.forEach(bet => {
    const symbolIndex = SYMBOL_MAP[bet.symbolId as keyof typeof SYMBOL_MAP];
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
  return dice.map(d => SYMBOL_ID_MAP[d as keyof typeof SYMBOL_ID_MAP]);
}
