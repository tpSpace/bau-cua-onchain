"use client";

import { motion } from "framer-motion";
import { gameSymbols, getSymbolByContractIndex } from "@/types/game";

interface GameAnalysisProps {
  lastGameResult: any;
}

export function GameAnalysis({ lastGameResult }: GameAnalysisProps) {
  if (!lastGameResult || !lastGameResult.dice) {
    return null;
  }

  // Contract history format: dice contains the raw numbers
  const rawNumbers = lastGameResult.dice;
  const symbolIds = lastGameResult.dice;
  const winnings = lastGameResult.winnings;

  // Simple display formats
  const emojis = rawNumbers.map(
    (num: number) => getSymbolByContractIndex(num)?.emoji || "🎲"
  );
  const names = rawNumbers.map(
    (num: number) => getSymbolByContractIndex(num)?.englishName || "Unknown"
  );
  const vietnameseNames = rawNumbers.map(
    (num: number) => getSymbolByContractIndex(num)?.vietnameseName || "Unknown"
  );

  // Simple analysis
  const symbolCounts: Record<string, number> = {};
  symbolIds.forEach((symbol: string) => {
    symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
  });

  const matches = Object.entries(symbolCounts)
    .filter(([_, count]) => count >= 2)
    .map(([symbol, count]) => ({
      symbol,
      count,
      emoji: gameSymbols.find((s) => s.id === symbol)?.emoji || "🎲",
    }));

  const isTriple = matches.some((match) => match.count === 3);
  const isPair = matches.some((match) => match.count === 2);

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-xl font-bold text-white mb-4 text-center">
        Dice Result Analysis
      </h3>

      <div className="space-y-4">
        {/* Visual Display Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
            <h4 className="font-semibold text-blue-200 mb-2">
              Display Formats
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Simple:</span>
                <span className="text-2xl">{emojis.join("")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">With Numbers:</span>
                <span className="font-mono text-blue-200">
                  {rawNumbers
                    .map((num: number, i: number) => `[${num}] ${emojis[i]}`)
                    .join("  ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">English:</span>
                <span className="text-blue-200">{names.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Vietnamese:</span>
                <span className="text-blue-200">
                  {vietnameseNames.join(", ")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <h4 className="font-semibold text-green-200 mb-2">
              Match Analysis
            </h4>
            <div className="space-y-2 text-sm">
              {matches.length > 0 ? (
                <>
                  {isTriple && (
                    <div className="text-yellow-300 font-bold">
                      🎉 TRIPLE MATCH!
                    </div>
                  )}
                  {isPair && !isTriple && (
                    <div className="text-green-300 font-bold">
                      ✅ PAIR MATCH!
                    </div>
                  )}
                  {matches.map((match, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-300">
                        {match.count}x {match.emoji}
                      </span>
                      <span className="text-green-200">{match.symbol}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-gray-400">No matches</div>
              )}
            </div>
          </div>
        </div>

        {/* Result Summary */}
        <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20 text-center">
          <div className="text-lg font-bold text-purple-200 mb-2">
            {emojis.join(" ")}
          </div>
          <div className="text-sm text-purple-300 mb-2">
            {rawNumbers
              .map(
                (num: number, i: number) => `${num} → ${names[i]} ${emojis[i]}`
              )
              .join(" | ")}
          </div>
          <div
            className={`font-bold ${
              winnings > 0 ? "text-green-300" : "text-red-300"
            }`}
          >
            {winnings > 0
              ? `WON ${winnings.toFixed(4)} SUI! 🎉`
              : `No winnings this round 😔`}
          </div>
        </div>

        {/* Raw Data Access (for developers) */}
        <details className="bg-gray-500/10 rounded-lg border border-gray-500/20">
          <summary className="p-3 cursor-pointer text-gray-300 font-semibold">
            🔧 Developer Data Access
          </summary>
          <div className="p-4 pt-0">
            <div className="bg-black/20 rounded p-3 font-mono text-xs text-gray-300 overflow-auto">
              <div className="mb-2 text-yellow-300">
                // Access dice results directly:
              </div>
              <div>const rawNumbers = lastGameResult.dice;</div>
              <div>const symbolIds = lastGameResult.dice;</div>
              <div>const winnings = lastGameResult.winnings;</div>
              <div className="mt-2 text-yellow-300">// Raw data:</div>
              <pre>
                {JSON.stringify({ rawNumbers, symbolIds, winnings }, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      </div>
    </motion.div>
  );
}
