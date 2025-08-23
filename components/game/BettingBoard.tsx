"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { RotateCcw, Dices, Loader2 } from "lucide-react";
import { gameSymbols } from "@/types/game";
import type { Bet } from "@/types/game";

interface BettingBoardProps {
  bets: Bet[];
  currentBet: number;
  isConnected: boolean;
  isPlaying: boolean;
  canAffordBet: (amount: number) => boolean;
  onAddBet: (symbolId: string) => void;
  onSetCurrentBet: (amount: number) => void;
  onClearBets: () => void;
  onRollDice: () => void;
  getTotalBet: () => number;
  getBetAmount: (symbolId: string) => number;
}

export function BettingBoard({
  bets,
  currentBet,
  isConnected,
  isPlaying,
  canAffordBet,
  onAddBet,
  onSetCurrentBet,
  onClearBets,
  onRollDice,
  getTotalBet,
  getBetAmount,
}: BettingBoardProps) {
  const t = useTranslations();

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {t("game.bettingBoard")}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {gameSymbols.map((symbol, index) => (
          <motion.button
            key={symbol.id}
            onClick={() => onAddBet(symbol.id)}
            className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
              getBetAmount(symbol.id) > 0
                ? "border-yellow-400 bg-yellow-400/20"
                : "border-white/30 bg-white/5 hover:bg-white/10"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            disabled={!isConnected || !canAffordBet(getTotalBet() + currentBet)}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">{symbol.emoji}</div>
              <div className="text-white font-semibold">{t(symbol.name)}</div>
              <div className="text-yellow-300 text-sm">
                {symbol.multiplier}x
              </div>
              {getBetAmount(symbol.id) > 0 && (
                <motion.div
                  className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {getBetAmount(symbol.id)}
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Bet Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white">Bet Amount (SUI):</span>
          {[0.1, 0.25, 0.5, 1.0].map((amount) => (
            <button
              key={amount}
              onClick={() => onSetCurrentBet(amount)}
              disabled={!isConnected}
              className={`px-3 py-1 rounded-lg transition-colors disabled:opacity-50 cursor-pointer ${
                currentBet === amount
                  ? "bg-yellow-400 text-black"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {amount}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={onClearBets}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer"
            whileHover={{ scale: 1.05 }}
            disabled={bets.length === 0}
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </motion.button>

          <motion.button
            onClick={onRollDice}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            disabled={bets.length === 0 || isPlaying || !isConnected}
          >
            {isPlaying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Dices className="w-5 h-5" />
            )}
            {isPlaying
              ? "Rolling..."
              : `Roll (${getTotalBet().toFixed(2)} SUI)`}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
