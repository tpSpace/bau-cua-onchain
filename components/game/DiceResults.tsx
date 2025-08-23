"use client";

import { motion } from "framer-motion";
import { gameSymbols } from "@/types/game";
import type { GameResult } from "@/types/game";

interface DiceResultsProps {
  diceResults: string[];
  isPlaying: boolean;
  gameHistory: GameResult[];
}

export function DiceResults({
  diceResults,
  isPlaying,
  gameHistory,
}: DiceResultsProps) {
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

      {diceResults.length > 0 && !isPlaying && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-yellow-300 font-bold">
            Last Winnings: {gameHistory[0]?.winnings.toFixed(4) || 0} SUI
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
