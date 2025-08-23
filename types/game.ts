// Shared types for the game components

export interface GameSymbol {
  id: string;
  emoji: string;
  name: string;
  englishName: string;
  vietnameseName: string;
  color: string;
  multiplier: number;
  contractIndex: number; // For smart contract mapping
}

export interface Bet {
  symbolId: string;
  amount: number;
}

export interface GameResult {
  dice: string[];
  winnings: number;
  timestamp: Date;
}

export interface RandomnessDetails {
  transactionDigest?: string;
  timestamp?: Date;
  rawNumbers?: number[];
  convertedSymbols?: string[];
  emojis?: string[];
}

// Consolidated game symbols with ALL data (UI + Contract)
export const gameSymbols: GameSymbol[] = [
  {
    id: "bau",
    emoji: "🥒",
    name: "symbols.bau",
    englishName: "Gourd",
    vietnameseName: "Bầu",
    color: "bg-green-500",
    multiplier: 2,
    contractIndex: 0,
  },
  {
    id: "cua",
    emoji: "🦀",
    name: "symbols.cua",
    englishName: "Crab",
    vietnameseName: "Cua",
    color: "bg-red-500",
    multiplier: 2,
    contractIndex: 4,
  },
  {
    id: "tom",
    emoji: "🦐",
    name: "symbols.tom",
    englishName: "Shrimp",
    vietnameseName: "Tôm",
    color: "bg-pink-500",
    multiplier: 2,
    contractIndex: 1,
  },
  {
    id: "ca",
    emoji: "🐟",
    name: "symbols.ca",
    englishName: "Fish",
    vietnameseName: "Cá",
    color: "bg-blue-500",
    multiplier: 2,
    contractIndex: 2,
  },
  {
    id: "ga",
    emoji: "🐓",
    name: "symbols.ga",
    englishName: "Rooster",
    vietnameseName: "Gà",
    color: "bg-yellow-500",
    multiplier: 2,
    contractIndex: 3,
  },
  {
    id: "nai",
    emoji: "🦌",
    name: "symbols.nai",
    englishName: "Deer",
    vietnameseName: "Nai",
    color: "bg-orange-500",
    multiplier: 2,
    contractIndex: 5,
  },
];

// Utility functions derived from gameSymbols
export const getSymbolByContractIndex = (index: number): GameSymbol | undefined => 
  gameSymbols.find(symbol => symbol.contractIndex === index);

export const getSymbolById = (id: string): GameSymbol | undefined =>
  gameSymbols.find(symbol => symbol.id === id);

export const getContractIndex = (symbolId: string): number =>
  gameSymbols.find(symbol => symbol.id === symbolId)?.contractIndex ?? -1;

export const contractIndicesToSymbolIds = (indices: number[]): string[] =>
  indices.map(index => getSymbolByContractIndex(index)?.id || "unknown");
