"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { WalletButton } from "@/components/WalletButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useGameContract } from "@/hooks/useGameContract";
import {
  Home,
  Coins,
  Dices,
  RotateCcw,
  Play,
  History,
  Trophy,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Wallet,
} from "lucide-react";
import Link from "next/link";

// Game symbols with their multipliers
const gameSymbols = [
  {
    id: "bau",
    emoji: "🥒",
    name: "symbols.bau",
    color: "bg-green-500",
    multiplier: 2,
  },
  {
    id: "cua",
    emoji: "🦀",
    name: "symbols.cua",
    color: "bg-red-500",
    multiplier: 2,
  },
  {
    id: "tom",
    emoji: "🦐",
    name: "symbols.tom",
    color: "bg-pink-500",
    multiplier: 2,
  },
  {
    id: "ca",
    emoji: "🐟",
    name: "symbols.ca",
    color: "bg-blue-500",
    multiplier: 2,
  },
  {
    id: "ga",
    emoji: "🐓",
    name: "symbols.ga",
    color: "bg-yellow-500",
    multiplier: 2,
  },
  {
    id: "nai",
    emoji: "🦌",
    name: "symbols.nai",
    color: "bg-orange-500",
    multiplier: 2,
  },
];

interface Bet {
  symbolId: string;
  amount: number;
}

interface GameResult {
  dice: string[];
  winnings: number;
  timestamp: Date;
}

export default function GamePage() {
  const t = useTranslations();
  const {
    gameState,
    isConnected,
    userAddress,
    totalBalance,
    playGame,
    loadUserCoins,
    loadBankBalance,
    loadContractHistory,
    canAffordBet,
    clearError,
    lastGameResult,
  } = useGameContract();

  const [bets, setBets] = useState<Bet[]>([]);
  const [currentBet, setCurrentBet] = useState(0.1); // In SUI
  const [diceResults, setDiceResults] = useState<string[]>([]);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showContractHistory, setShowContractHistory] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Load initial data when wallet connects
  useEffect(() => {
    if (isConnected && userAddress) {
      loadUserCoins();
      loadBankBalance();
      loadContractHistory();
    }
  }, [
    isConnected,
    userAddress,
    loadUserCoins,
    loadBankBalance,
    loadContractHistory,
  ]);

  // Handle game result
  useEffect(() => {
    console.log("useEffect - lastGameResult changed:", lastGameResult);

    if (lastGameResult) {
      console.log("Processing new game result:", lastGameResult);

      setDiceResults(lastGameResult.dice);

      const newGameResult: GameResult = {
        dice: lastGameResult.dice,
        winnings: lastGameResult.winnings,
        timestamp: new Date(),
      };

      console.log("Adding to history:", newGameResult);
      setGameHistory((prev) => {
        const newHistory = [newGameResult, ...prev.slice(0, 9)];
        console.log("New history:", newHistory);
        return newHistory;
      });

      if (lastGameResult.winnings > 0) {
        setSuccessMessage(
          `You won ${lastGameResult.winnings.toFixed(4)} SUI! 🎉`
        );
      } else {
        setSuccessMessage("Better luck next time! 🎲");
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [lastGameResult]);

  const addBet = (symbolId: string) => {
    if (!isConnected) return;
    if (!canAffordBet(getTotalBet() + currentBet)) return;

    const existingBet = bets.find((bet) => bet.symbolId === symbolId);
    if (existingBet) {
      setBets(
        bets.map((bet) =>
          bet.symbolId === symbolId
            ? { ...bet, amount: bet.amount + currentBet }
            : bet
        )
      );
    } else {
      setBets([...bets, { symbolId, amount: currentBet }]);
    }
  };

  const clearBets = () => {
    setBets([]);
    clearError();
  };

  const rollDice = async () => {
    if (bets.length === 0 || !isConnected) return;

    try {
      console.log("Starting game with bets:", bets);
      clearError();
      setSuccessMessage("");

      // Convert bets to the format expected by the contract
      const contractBets = bets.map((bet) => ({
        symbolId: bet.symbolId,
        amount: bet.amount,
      }));

      console.log("Converted bets for contract:", contractBets);

      const result = await playGame(contractBets);
      console.log("PlayGame returned:", result);

      setBets([]);
    } catch (error: any) {
      console.error("Game error:", error);
      // Error is handled by the hook
    }
  };

  const getTotalBet = () => bets.reduce((sum, bet) => sum + bet.amount, 0);
  const getBetAmount = (symbolId: string) =>
    bets.find((bet) => bet.symbolId === symbolId)?.amount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-800 to-yellow-700 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat" />
      </div>

      {/* Header */}
      <motion.header
        className="flex justify-between items-center p-6 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <Link href="/">
            <motion.button
              className="flex items-center gap-2 text-white hover:text-yellow-300 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">{t("common.home")}</span>
            </motion.button>
          </Link>
          <div className="flex items-center gap-2 text-white">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-lg">
              {isConnected ? `${totalBalance.toFixed(4)} SUI` : "-- SUI"}
            </span>
            {gameState.bankBalance !== null && (
              <span className="text-sm text-yellow-200 ml-2">
                (Bank: {gameState.bankBalance.toFixed(2)} SUI)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <WalletButton />
        </div>
      </motion.header>

      <div className="px-6 pb-6 relative z-10">
        {/* Game Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-red-300 to-pink-300 mb-4">
            {t("home.title")}
          </h1>
          <p className="text-yellow-100 text-lg">{t("game.subtitle")}</p>
        </motion.div>

        {/* Wallet Connection Notice */}
        {!isConnected && (
          <motion.div
            className="max-w-2xl mx-auto mb-8 p-6 bg-blue-500/20 border border-blue-400/30 rounded-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Wallet className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-blue-100">
              Connect your Sui wallet to start playing with real SUI on the
              blockchain!
            </p>
          </motion.div>
        )}

        {/* Error Display */}
        {gameState.error && (
          <motion.div
            className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/20 border border-red-400/30 rounded-xl flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-100">{gameState.error}</p>
            <button
              onClick={clearError}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Success Message */}
        {successMessage && (
          <motion.div
            className="max-w-2xl mx-auto mb-8 p-4 bg-green-500/20 border border-green-400/30 rounded-xl flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-100">{successMessage}</p>
          </motion.div>
        )}

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Betting Board */}
          <div className="lg:col-span-2">
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
                    onClick={() => addBet(symbol.id)}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                      getBetAmount(symbol.id) > 0
                        ? "border-yellow-400 bg-yellow-400/20"
                        : "border-white/30 bg-white/5 hover:bg-white/10"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    disabled={
                      !isConnected || !canAffordBet(getTotalBet() + currentBet)
                    }
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{symbol.emoji}</div>
                      <div className="text-white font-semibold">
                        {t(symbol.name)}
                      </div>
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
                      onClick={() => setCurrentBet(amount)}
                      disabled={!isConnected}
                      className={`px-3 py-1 rounded-lg transition-colors disabled:opacity-50 ${
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
                    onClick={clearBets}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    disabled={bets.length === 0}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear
                  </motion.button>

                  <motion.button
                    onClick={rollDice}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    disabled={
                      bets.length === 0 || gameState.isPlaying || !isConnected
                    }
                  >
                    {gameState.isPlaying ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Dices className="w-5 h-5" />
                    )}
                    {gameState.isPlaying
                      ? "Rolling..."
                      : `Roll (${getTotalBet().toFixed(2)} SUI)`}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Game Results & History */}
          <div className="space-y-6">
            {/* Dice Results */}
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
                    animate={gameState.isPlaying ? { rotateY: 360 } : {}}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.2,
                      repeat: gameState.isPlaying ? Infinity : 0,
                    }}
                  >
                    {diceResults[index]
                      ? gameSymbols.find((s) => s.id === diceResults[index])
                          ?.emoji
                      : "🎲"}
                  </motion.div>
                ))}
              </div>

              {diceResults.length > 0 && !gameState.isPlaying && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-yellow-300 font-bold">
                    Last Winnings: {gameHistory[0]?.winnings.toFixed(4) || 0}{" "}
                    SUI
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Game History */}
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Your History</h3>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-yellow-300 hover:text-yellow-200 transition-colors"
                >
                  <History className="w-5 h-5" />
                </button>
              </div>

              {showHistory && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {gameHistory.map((game, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/5 rounded-lg p-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
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
                            game.winnings > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {game.winnings > 0 ? "+" : ""}
                          {game.winnings.toFixed(4)} SUI
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {gameHistory.length === 0 && (
                    <div className="text-white/60 text-center py-4">
                      No games played yet
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Contract Activity History */}
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Global Activity
                </h3>
                <div className="flex items-center gap-2">
                  {gameState.isLoadingHistory && (
                    <Loader2 className="w-4 h-4 text-yellow-300 animate-spin" />
                  )}
                  <button
                    onClick={() => setShowContractHistory(!showContractHistory)}
                    className="text-yellow-300 hover:text-yellow-200 transition-colors"
                  >
                    <TrendingUp className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {showContractHistory && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {gameState.contractHistory.map((activity, index) => (
                    <motion.div
                      key={activity.digest}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      {/* Transaction Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Trophy
                            className={`w-4 h-4 ${
                              activity.isWin ? "text-green-400" : "text-red-400"
                            }`}
                          />
                          <span className="text-white font-medium">
                            {activity.isWin ? "WIN" : "LOSS"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {activity.timestamp.toLocaleString()}
                        </span>
                      </div>

                      {/* Game Results */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-1">
                          {activity.dice.map((die, i) => (
                            <span key={i} className="text-lg">
                              {gameSymbols.find((s) => s.id === die)?.emoji}
                            </span>
                          ))}
                        </div>
                        <div
                          className={`font-bold ${
                            activity.isWin ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {activity.isWin ? "+" : ""}
                          {activity.winnings.toFixed(4)} SUI
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="text-xs text-gray-300 space-y-1">
                        <div className="flex justify-between">
                          <span>Bet:</span>
                          <span>{activity.totalBet.toFixed(4)} SUI</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gas:</span>
                          <span>{activity.gasUsed.toFixed(6)} SUI</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Player:</span>
                          <span className="font-mono">
                            {activity.player.slice(0, 6)}...
                            {activity.player.slice(-4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>TX:</span>
                          <a
                            href={`https://suiscan.xyz/testnet/tx/${activity.digest}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-mono underline"
                          >
                            {activity.digest.slice(0, 8)}...
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {gameState.contractHistory.length === 0 &&
                    !gameState.isLoadingHistory && (
                      <div className="text-white/60 text-center py-4">
                        No contract activity found
                      </div>
                    )}

                  {gameState.isLoadingHistory && (
                    <div className="text-white/60 text-center py-4 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading activity...
                    </div>
                  )}
                </div>
              )}

              {/* Refresh Button */}
              {showContractHistory && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={() => loadContractHistory()}
                    disabled={gameState.isLoadingHistory}
                    className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors disabled:opacity-50 text-sm"
                  >
                    {gameState.isLoadingHistory
                      ? "Loading..."
                      : "Refresh Activity"}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
