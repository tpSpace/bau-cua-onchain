"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { RotateCcw, Loader2, Trophy, CheckCircle, Dices } from "lucide-react";
import { gameSymbols } from "@/types/game";

interface GameHistoryProps {
  gameState: {
    contractHistory: any[];
    isLoadingHistory: boolean;
  };
  onLoadContractHistory: (limit?: number) => void;
}

export function GameHistory({
  gameState,
  onLoadContractHistory,
}: GameHistoryProps) {
  const [currentLimit, setCurrentLimit] = useState(100);
  const hasLoadedRef = useRef(false);

  // History is loaded and refreshed by parent via hook; no auto-load here

  const loadMoreHistory = () => {
    const newLimit = currentLimit + 50;
    setCurrentLimit(newLimit);
    onLoadContractHistory(newLimit);
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30 shadow-lg shadow-purple-500/10"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            Game History
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {gameState.isLoadingHistory && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-4 h-4 text-amber-400" />
            </motion.div>
          )}
          <motion.button
            onClick={() => onLoadContractHistory(currentLimit)}
            disabled={gameState.isLoadingHistory}
            className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:text-blue-200 hover:bg-blue-500/30 transition-all disabled:opacity-50 border border-blue-400/30 cursor-pointer"
            title="Refresh from blockchain"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div
        className="space-y-3 max-h-[600px] overflow-y-auto game-history-scroll"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#ffd700 rgba(15, 23, 42, 0.6)",
        }}
      >
        {/* Contract History (blockchain data) */}
        {gameState.contractHistory && gameState.contractHistory.length > 0 ? (
          gameState.contractHistory.map((activity, index) => (
            <motion.div
              key={activity.digest}
              className={`rounded-xl p-4 border backdrop-blur-sm transition-all ${
                activity.winnings - activity.totalBet > 0
                  ? "bg-gradient-to-r from-emerald-900/30 to-green-900/30 border-emerald-400/40 shadow-lg shadow-emerald-500/10"
                  : activity.winnings - activity.totalBet === 0
                  ? "bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-400/40 shadow-lg shadow-yellow-500/10"
                  : "bg-gradient-to-r from-red-900/30 to-rose-900/30 border-red-400/40 shadow-lg shadow-red-500/10"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              {/* Game Result Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.02 + 0.2 }}
                  >
                    <Trophy
                      className={`w-5 h-5 ${
                        activity.winnings - activity.totalBet > 0
                          ? "text-emerald-400"
                          : activity.winnings - activity.totalBet === 0
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`font-bold text-lg ${
                      activity.winnings - activity.totalBet > 0
                        ? "text-emerald-300"
                        : activity.winnings - activity.totalBet === 0
                        ? "text-yellow-300"
                        : "text-red-300"
                    }`}
                  >
                    {activity.winnings - activity.totalBet > 0
                      ? "🎉 WIN"
                      : activity.winnings - activity.totalBet === 0
                      ? "⚖️ EVEN"
                      : "💔 LOSS"}
                  </span>
                  {activity.winnings - activity.totalBet >= 0 && (
                    <motion.div
                      className={`text-xs font-bold px-2 py-1 rounded-full border ${
                        activity.winnings - activity.totalBet > 0
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                          : "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.02 + 0.4 }}
                    >
                      {activity.winnings - activity.totalBet > 0
                        ? `+${activity.winnings.toFixed(2)} SUI`
                        : "+0 SUI"}
                    </motion.div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">
                    {activity.timestamp.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Dice Results */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-3">
                  {activity.dice.map((die: string, i: number) => (
                    <motion.div
                      key={i}
                      className="text-center"
                      initial={{ scale: 0, rotateY: 180 }}
                      animate={{ scale: 1, rotateY: 0 }}
                      transition={{ delay: index * 0.02 + i * 0.1 + 0.3 }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-lg flex items-center justify-center border border-amber-400/30 shadow-lg">
                        <div className="text-2xl">
                          {gameSymbols.find((s) => s.id === die)?.emoji || "🎲"}
                        </div>
                      </div>
                      <div className="text-xs text-amber-300 mt-1 font-medium capitalize">
                        {die}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="text-right">
                  <motion.div
                    className={`font-bold text-xl ${
                      activity.winnings - activity.totalBet > 0
                        ? "text-emerald-400"
                        : activity.winnings - activity.totalBet === 0
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.02 + 0.6 }}
                  >
                    {activity.winnings - activity.totalBet > 0
                      ? "+"
                      : activity.winnings - activity.totalBet === 0
                      ? "="
                      : "-"}
                    {Math.abs(activity.winnings - activity.totalBet).toFixed(4)}{" "}
                    SUI
                  </motion.div>
                  <div className="text-xs text-slate-400 bg-slate-700/30 px-2 py-1 rounded">
                    Bet: {activity.totalBet.toFixed(4)} SUI
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Player:</span>
                    <span className="text-gray-300 font-mono">
                      {activity.player.slice(0, 6)}...
                      {activity.player.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gas Used:</span>
                    <span className="text-gray-300">
                      {activity.gasUsed.toFixed(6)} SUI
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Profit/Loss:</span>
                    <span
                      className={`${
                        activity.winnings - activity.totalBet > 0
                          ? "text-green-300"
                          : activity.winnings - activity.totalBet === 0
                          ? "text-yellow-300"
                          : "text-red-300"
                      }`}
                    >
                      {activity.winnings - activity.totalBet === 0
                        ? "Even"
                        : activity.winnings - activity.totalBet > 0
                        ? `+${(activity.winnings - activity.totalBet).toFixed(
                            4
                          )} SUI`
                        : `${(activity.winnings - activity.totalBet).toFixed(
                            4
                          )} SUI`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">TX:</span>
                    <a
                      href={`https://suiscan.xyz/testnet/tx/${activity.digest}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline font-mono cursor-pointer"
                    >
                      {activity.digest.slice(0, 8)}...
                    </a>
                  </div>
                </div>
              </div>

              {/* Event Data Badge */}
              <div className="mt-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-green-300">Smart Contract Event</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Verified on blockchain
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-4">
            No blockchain history available
          </div>
        )}

        {/* No local fallback data - only show verified blockchain history */}

        {/* Empty State - Only check blockchain history */}
        {gameState.contractHistory.length === 0 &&
          !gameState.isLoadingHistory && (
            <div className="text-white/60 text-center py-8">
              <Dices className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium mb-2">
                No verified games found
              </div>
              <div className="text-sm">
                Only blockchain-verified games are displayed here.
                <br />
                Play games and wait for blockchain confirmation!
              </div>
            </div>
          )}

        {/* Loading State */}
        {gameState.isLoadingHistory && (
          <div className="text-white/60 text-center py-8 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <div className="text-sm">Loading blockchain history...</div>
          </div>
        )}

        {/* Load More Button */}
        {!gameState.isLoadingHistory &&
          gameState.contractHistory &&
          gameState.contractHistory.length >= currentLimit && (
            <motion.div
              className="text-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.button
                onClick={loadMoreHistory}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Load More Games ({currentLimit + 50})
              </motion.button>
              <div className="text-xs text-gray-400 mt-2">
                Currently showing {gameState.contractHistory.length} of all
                games
              </div>
            </motion.div>
          )}
      </div>

      {/* Quick Stats */}
      {gameState.contractHistory && gameState.contractHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-blue-300 font-bold">
                {gameState.contractHistory.length}
              </div>
              <div className="text-gray-400">Total Games</div>
            </div>
            <div>
              <div className="text-green-300 font-bold">
                {gameState.contractHistory.filter((a: any) => a.isWin).length}
              </div>
              <div className="text-gray-400">Wins</div>
            </div>
            <div>
              <div className="text-red-300 font-bold">
                {Math.round(
                  (gameState.contractHistory.filter((a: any) => a.isWin)
                    .length /
                    gameState.contractHistory.length) *
                    100
                ) || 0}
                %
              </div>
              <div className="text-gray-400">Win Rate</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
