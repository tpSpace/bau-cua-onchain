"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  History,
  RotateCcw,
  Loader2,
  Trophy,
  CheckCircle,
  Dices,
} from "lucide-react";
import { gameSymbols } from "@/types/game";
import type { GameResult } from "@/types/game";

interface GameHistoryProps {
  gameHistory: GameResult[];
  gameState: {
    contractHistory: any[];
    isLoadingHistory: boolean;
  };
  onLoadContractHistory: () => void;
}

export function GameHistory({
  gameHistory,
  gameState,
  onLoadContractHistory,
}: GameHistoryProps) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Game History</h3>
        <div className="flex items-center gap-2">
          {gameState.isLoadingHistory && (
            <Loader2 className="w-4 h-4 text-yellow-300 animate-spin" />
          )}
          <button
            onClick={() => onLoadContractHistory()}
            disabled={gameState.isLoadingHistory}
            className="text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
            title="Refresh from blockchain"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-yellow-300 hover:text-yellow-200 transition-colors"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {/* Contract History (blockchain data) */}
          {gameState.contractHistory.map((activity, index) => (
            <motion.div
              key={activity.digest}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              {/* Game Result Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy
                    className={`w-4 h-4 ${
                      activity.isWin ? "text-green-400" : "text-red-400"
                    }`}
                  />
                  <span className="text-white font-medium">
                    {activity.isWin ? "🎉 WIN" : "😔 LOSS"}
                  </span>
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
                <div className="flex gap-2">
                  {activity.dice.map((die: string, i: number) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl">
                        {gameSymbols.find((s) => s.id === die)?.emoji || "🎲"}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {die}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <div
                    className={`font-bold text-lg ${
                      activity.isWin ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {activity.isWin ? "+" : ""}
                    {activity.winnings.toFixed(4)} SUI
                  </div>
                  <div className="text-xs text-gray-400">
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
                          : "text-red-300"
                      }`}
                    >
                      {activity.winnings - activity.totalBet > 0 ? "+" : ""}
                      {(activity.winnings - activity.totalBet).toFixed(4)} SUI
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">TX:</span>
                    <a
                      href={`https://suiscan.xyz/testnet/tx/${activity.digest}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline font-mono"
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
          ))}

          {/* Local Game History (if any newer than blockchain) */}
          {gameHistory
            .filter(
              (game) =>
                !gameState.contractHistory.some(
                  (activity) => activity.dice.join("") === game.dice.join("")
                )
            )
            .map((game, index) => (
              <motion.div
                key={`local-${index}`}
                className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: (gameState.contractHistory.length + index) * 0.02,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                  <span className="text-yellow-300 text-sm">
                    Processing on blockchain...
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    {game.dice.map((die, i) => (
                      <span key={i} className="text-lg">
                        {gameSymbols.find((s) => s.id === die)?.emoji}
                      </span>
                    ))}
                  </div>
                  <div
                    className={`font-bold ${
                      game.winnings > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {game.winnings > 0 ? "+" : ""}
                    {game.winnings.toFixed(4)} SUI
                  </div>
                </div>
              </motion.div>
            ))}

          {/* Empty State */}
          {gameState.contractHistory.length === 0 &&
            gameHistory.length === 0 &&
            !gameState.isLoadingHistory && (
              <div className="text-white/60 text-center py-8">
                <Dices className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">
                  No games played yet
                </div>
                <div className="text-sm">
                  Start playing to see your game history with blockchain
                  verification!
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
        </div>
      )}

      {/* Quick Stats */}
      {showHistory && gameState.contractHistory.length > 0 && (
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
