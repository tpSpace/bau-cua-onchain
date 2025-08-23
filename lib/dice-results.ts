/**
 * Simple utility functions to access and display dice results from your smart contract
 */

// Note: gameSymbols will be passed as parameter when needed

export interface DiceResult {
  rawNumbers: number[];           // [2, 1, 4] - Original contract numbers
  symbolIds: string[];           // ["ca", "tom", "cua"] - Converted to symbols  
  symbolNames: string[];         // ["Fish", "Shrimp", "Crab"] - English names
  vietnameseNames: string[];     // ["Cá", "Tôm", "Cua"] - Vietnamese names
  emojis: string[];              // ["🐟", "🦐", "🦀"] - Display emojis
  winnings: number;              // SUI amount won
  totalBet: number;              // SUI amount bet
  transactionDigest?: string;    // Blockchain proof
}

// Symbol mapping from contract numbers to game data
const SYMBOL_DATA = {
  0: { id: "bau", english: "Gourd", vietnamese: "Bầu", emoji: "🥒" },
  1: { id: "tom", english: "Shrimp", vietnamese: "Tôm", emoji: "🦐" },
  2: { id: "ca", english: "Fish", vietnamese: "Cá", emoji: "🐟" },
  3: { id: "ga", english: "Rooster", vietnamese: "Gà", emoji: "🐓" },
  4: { id: "cua", english: "Crab", vietnamese: "Cua", emoji: "🦀" },
  5: { id: "nai", english: "Deer", vietnamese: "Nai", emoji: "🦌" },
};

/**
 * Convert raw dice numbers from contract to complete dice result
 */
export function createDiceResult(
  rawNumbers: number[],
  winnings: number = 0,
  totalBet: number = 0,
  transactionDigest?: string
): DiceResult {
  const symbolIds = rawNumbers.map(num => SYMBOL_DATA[num as keyof typeof SYMBOL_DATA]?.id || "unknown");
  const symbolNames = rawNumbers.map(num => SYMBOL_DATA[num as keyof typeof SYMBOL_DATA]?.english || "Unknown");
  const vietnameseNames = rawNumbers.map(num => SYMBOL_DATA[num as keyof typeof SYMBOL_DATA]?.vietnamese || "Unknown");
  const emojis = rawNumbers.map(num => SYMBOL_DATA[num as keyof typeof SYMBOL_DATA]?.emoji || "🎲");

  return {
    rawNumbers,
    symbolIds,
    symbolNames,
    vietnameseNames,
    emojis,
    winnings,
    totalBet,
    transactionDigest,
  };
}

/**
 * Format dice result for display
 */
export function formatDiceDisplay(result: DiceResult): {
  compact: string;
  detailed: string;
  winLoss: string;
} {
  const compact = result.emojis.join(" ");
  
  const detailed = result.rawNumbers
    .map((num, i) => `${num} → ${result.symbolNames[i]} ${result.emojis[i]}`)
    .join(" | ");
  
  const winLoss = result.winnings > 0 
    ? `WON ${result.winnings.toFixed(4)} SUI! 🎉`
    : `Lost ${result.totalBet.toFixed(4)} SUI 😔`;

  return { compact, detailed, winLoss };
}

/**
 * Check if dice result contains winning combinations
 */
export function analyzeDiceResult(result: DiceResult): {
  matches: { symbol: string; count: number; emoji: string }[];
  isTriple: boolean;
  isPair: boolean;
  totalMatches: number;
} {
  const symbolCounts: Record<string, number> = {};
  
  // Count occurrences of each symbol
  result.symbolIds.forEach(symbol => {
    symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
  });

  // Find matches (2 or more of same symbol)
  const matches = Object.entries(symbolCounts)
    .filter(([_, count]) => count >= 2)
    .map(([symbol, count]) => ({
      symbol,
      count,
      emoji: SYMBOL_DATA[result.rawNumbers.find(num => 
        SYMBOL_DATA[num as keyof typeof SYMBOL_DATA]?.id === symbol
      ) as keyof typeof SYMBOL_DATA]?.emoji || "🎲"
    }));

  const isTriple = matches.some(match => match.count === 3);
  const isPair = matches.some(match => match.count === 2);
  const totalMatches = matches.reduce((sum, match) => sum + match.count, 0);

  return { matches, isTriple, isPair, totalMatches };
}

/**
 * Generate random dice result (for testing/demo)
 */
export function generateRandomDice(): DiceResult {
  const rawNumbers = [
    Math.floor(Math.random() * 6),
    Math.floor(Math.random() * 6),
    Math.floor(Math.random() * 6),
  ];
  
  return createDiceResult(rawNumbers, 0, 0.1);
}

/**
 * Example usage in your React components
 */
export const DiceResultExamples = {
  // Access current game result
  getCurrentDice: (lastGameResult: any): DiceResult | null => {
    if (!lastGameResult || !lastGameResult.rawDice) return null;
    
    return createDiceResult(
      lastGameResult.rawDice,
      lastGameResult.winnings,
      lastGameResult.totalBet,
      lastGameResult.transactionDigest
    );
  },

  // Display dice in different formats
  displayFormats: (result: DiceResult) => ({
    // Simple emoji display: "🐟🦐🦀"
    simple: result.emojis.join(""),
    
    // Spaced emoji display: "🐟 🦐 🦀"
    spaced: result.emojis.join(" "),
    
    // With numbers: "[2] 🐟  [1] 🦐  [4] 🦀"
    withNumbers: result.rawNumbers.map((num, i) => `[${num}] ${result.emojis[i]}`).join("  "),
    
    // Full description: "Fish, Shrimp, Crab"
    description: result.symbolNames.join(", "),
    
    // Vietnamese: "Cá, Tôm, Cua"
    vietnamese: result.vietnameseNames.join(", "),
  }),
};
