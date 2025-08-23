"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { gameSymbols } from "@/types/game";

interface DiceResultsProps {
  isPlaying: boolean;
  lastGameResult: any; // Real contract result with dice data
  randomnessDetails: any; // Randomness details for expandable section
}

export function DiceResults({
  isPlaying,
  lastGameResult,
  randomnessDetails,
}: DiceResultsProps) {
  // Use real on-chain dice data from contract history
  const diceResults = lastGameResult?.dice || [];
  const [showRandomnessDetails, setShowRandomnessDetails] = useState(false);

  console.log(
    "DiceResults - lastGameResult from contract history:",
    lastGameResult
  );
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h3 className="text-xl font-bold text-white mb-4 text-center">
        Dice Results
      </h3>

      <div className="flex justify-center gap-4 mb-4">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl"
            animate={isPlaying ? { rotateY: 360 } : {}}
            transition={{
              duration: 0.5,
              delay: index * 0.2,
              repeat: isPlaying ? Infinity : 0,
            }}
          >
            {diceResults[index]
              ? gameSymbols.find((s) => s.id === diceResults[index])?.emoji
              : "🎲"}
          </motion.div>
        ))}
      </div>

      {diceResults.length > 0 &&
        !isPlaying &&
        lastGameResult?.winnings !== undefined && (
          <motion.div
            className="text-center space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-yellow-300 font-bold">
              Last Winnings: {lastGameResult.winnings.toFixed(4)} SUI
            </div>

            {/* Randomness Details Button */}
            <motion.button
              onClick={() => setShowRandomnessDetails(!showRandomnessDetails)}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30 hover:bg-blue-500/30 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Info className="w-4 h-4" />
              <span>Randomness Details</span>
              {showRandomnessDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </motion.button>

            {/* Expandable Randomness Details */}
            {showRandomnessDetails && randomnessDetails && (
              <motion.div
                className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-600/30 text-left"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  Blockchain Randomness
                </h4>

                {randomnessDetails.transactionDigest && (
                  <div className="mb-3">
                    <span className="text-gray-400 text-sm">Transaction:</span>
                    <a
                      href={`https://suiscan.xyz/testnet/tx/${randomnessDetails.transactionDigest}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-400 hover:text-blue-300 underline font-mono text-sm break-all"
                    >
                      {randomnessDetails.transactionDigest}
                    </a>
                  </div>
                )}

                {randomnessDetails.rawNumbers && (
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-400 text-sm">
                        Raw Numbers:
                      </span>
                      <div className="text-white font-mono text-sm">
                        [{randomnessDetails.rawNumbers.join(", ")}]
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400 text-sm">
                        Converted Symbols:
                      </span>
                      <div className="text-white font-mono text-sm">
                        [{randomnessDetails.convertedSymbols?.join(", ")}]
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400 text-sm">Emojis:</span>
                      <div className="text-xl">
                        {randomnessDetails.emojis?.join(" ")}
                      </div>
                    </div>
                  </div>
                )}

                {randomnessDetails.timestamp && (
                  <div className="mt-3 pt-3 border-t border-slate-600/30">
                    <span className="text-gray-400 text-xs">
                      Generated:{" "}
                      {new Date(randomnessDetails.timestamp).toLocaleString()}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
    </motion.div>
  );
}
