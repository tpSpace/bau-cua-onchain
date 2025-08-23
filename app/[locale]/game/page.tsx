"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { WalletButton } from "@/components/WalletButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useGameContract } from "@/hooks/useGameContract";
import {
  createDiceResult,
  formatDiceDisplay,
  analyzeDiceResult,
  DiceResultExamples,
} from "@/lib/dice-results";
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
  Shuffle,
  Info,
  ExternalLink,
  Hash,
  Clock,
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
  const [rawDiceNumbers, setRawDiceNumbers] = useState<number[]>([]);
  const [randomnessDetails, setRandomnessDetails] = useState<{
    transactionDigest?: string;
    timestamp?: Date;
    rawNumbers?: number[];
    convertedSymbols?: string[];
    emojis?: string[];
  }>({});
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [showRandomDetails, setShowRandomDetails] = useState(false);
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

      // Extract detailed randomness information
      if (lastGameResult && (lastGameResult as any).rawDice) {
        const rawNumbers = (lastGameResult as any).rawDice;
        const symbols = lastGameResult.dice;
        const emojis = symbols.map(
          (symbol) => gameSymbols.find((s) => s.id === symbol)?.emoji || "🎲"
        );

        setRawDiceNumbers(rawNumbers);
        setRandomnessDetails({
          transactionDigest: undefined, // Will be set from the transaction result
          timestamp: new Date(),
          rawNumbers,
          convertedSymbols: symbols,
          emojis,
        });

        console.log("🎲 RANDOMNESS DETAILS:");
        console.log("Raw numbers from contract:", rawNumbers);
        console.log("Converted to symbols:", symbols);
        console.log("Display emojis:", emojis);

        // Example: Access dice results using utility functions
        const diceResult = DiceResultExamples.getCurrentDice(lastGameResult);
        if (diceResult) {
          console.log("🎯 DICE RESULT OBJECT:", diceResult);
          console.log("📊 FORMATTED DISPLAY:", formatDiceDisplay(diceResult));
          console.log("🔍 MATCH ANALYSIS:", analyzeDiceResult(diceResult));

          // Example: Different display formats
          const displays = DiceResultExamples.displayFormats(diceResult);
          console.log("🎨 DISPLAY OPTIONS:");
          console.log("  Simple emojis:", displays.simple);
          console.log("  With numbers:", displays.withNumbers);
          console.log("  English names:", displays.description);
          console.log("  Vietnamese names:", displays.vietnamese);
        }
      }

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
  }, [lastGameResult, gameState.lastGameResult]);

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

      // Update randomness details with transaction digest
      if (result.transactionDigest) {
        setRandomnessDetails((prev) => ({
          ...prev,
          transactionDigest: result.transactionDigest,
        }));
      }

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

            {/* Randomness Details */}
            {randomnessDetails.rawNumbers &&
              randomnessDetails.rawNumbers.length > 0 && (
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Randomness Details
                    </h3>
                    <button
                      onClick={() => setShowRandomDetails(!showRandomDetails)}
                      className="text-yellow-300 hover:text-yellow-200 transition-colors"
                    >
                      <Shuffle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Compact View */}
                  {!showRandomDetails && (
                    <div className="text-center">
                      <div className="flex justify-center gap-2 mb-2">
                        {randomnessDetails.rawNumbers?.map((num, i) => (
                          <div key={i} className="text-center">
                            <div className="bg-blue-500/20 rounded-lg px-3 py-2 text-blue-200 font-mono text-sm">
                              {num}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">→</div>
                            <div className="text-2xl">
                              {randomnessDetails.emojis?.[i]}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">
                        Click shuffle icon for details
                      </p>
                    </div>
                  )}

                  {/* Detailed View */}
                  {showRandomDetails && (
                    <div className="space-y-4">
                      {/* Contract Random Numbers */}
                      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Hash className="w-4 h-4 text-blue-400" />
                          <h4 className="font-semibold text-blue-200">
                            Smart Contract Random Generation
                          </h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Source:</span>
                            <span className="text-blue-200 font-mono text-sm">
                              Sui VRF (Verifiable Random Function)
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Range:</span>
                            <span className="text-blue-200">
                              0-5 (inclusive)
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Generated:</span>
                            <span className="text-blue-200 font-mono">
                              [{randomnessDetails.rawNumbers?.join(", ")}]
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Conversion Process */}
                      <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Shuffle className="w-4 h-4 text-green-400" />
                          <h4 className="font-semibold text-green-200">
                            Number to Symbol Conversion
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {randomnessDetails.rawNumbers?.map((num, i) => {
                            const symbolMap = {
                              0: { name: "Bau (Gourd)", emoji: "🥒" },
                              1: { name: "Tom (Shrimp)", emoji: "🦐" },
                              2: { name: "Ca (Fish)", emoji: "🐟" },
                              3: { name: "Ga (Rooster)", emoji: "🐓" },
                              4: { name: "Cua (Crab)", emoji: "🦀" },
                              5: { name: "Nai (Deer)", emoji: "🦌" },
                            };
                            const symbol =
                              symbolMap[num as keyof typeof symbolMap];
                            return (
                              <div
                                key={i}
                                className="flex items-center justify-between bg-white/5 rounded px-3 py-2"
                              >
                                <span className="font-mono text-green-200">
                                  {num}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="text-green-200">
                                  {symbol?.name}
                                </span>
                                <span className="text-2xl">
                                  {symbol?.emoji}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Transaction Info */}
                      {randomnessDetails.transactionDigest && (
                        <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-3">
                            <ExternalLink className="w-4 h-4 text-purple-400" />
                            <h4 className="font-semibold text-purple-200">
                              Blockchain Verification
                            </h4>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">TX Digest:</span>
                              <a
                                href={`https://suiscan.xyz/testnet/tx/${randomnessDetails.transactionDigest}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-300 hover:text-purple-200 font-mono text-sm underline"
                              >
                                {randomnessDetails.transactionDigest?.slice(
                                  0,
                                  8
                                )}
                                ...
                              </a>
                            </div>
                            {randomnessDetails.timestamp && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-300">Time:</span>
                                <span className="text-purple-200 text-sm">
                                  {randomnessDetails.timestamp.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Security Info */}
                      <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-yellow-400" />
                          <h4 className="font-semibold text-yellow-200">
                            Security Features
                          </h4>
                        </div>
                        <ul className="space-y-1 text-sm text-yellow-100">
                          <li>✅ Cryptographically secure randomness</li>
                          <li>✅ Domain-separated per transaction</li>
                          <li>✅ Verifiable on blockchain</li>
                          <li>✅ Cannot be predicted or manipulated</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

            {/* Current Dice Result Analysis */}
            {lastGameResult && (lastGameResult as any).rawDice && (
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  Dice Result Analysis
                </h3>

                {(() => {
                  // Get current dice result using our utility
                  const currentDice =
                    DiceResultExamples.getCurrentDice(lastGameResult);
                  if (!currentDice) return null;

                  const displays =
                    DiceResultExamples.displayFormats(currentDice);
                  const analysis = analyzeDiceResult(currentDice);
                  const format = formatDiceDisplay(currentDice);

                  return (
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
                              <span className="text-2xl">
                                {displays.simple}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">
                                With Numbers:
                              </span>
                              <span className="font-mono text-blue-200">
                                {displays.withNumbers}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">English:</span>
                              <span className="text-blue-200">
                                {displays.description}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Vietnamese:</span>
                              <span className="text-blue-200">
                                {displays.vietnamese}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                          <h4 className="font-semibold text-green-200 mb-2">
                            Match Analysis
                          </h4>
                          <div className="space-y-2 text-sm">
                            {analysis.matches.length > 0 ? (
                              <>
                                {analysis.isTriple && (
                                  <div className="text-yellow-300 font-bold">
                                    🎉 TRIPLE MATCH!
                                  </div>
                                )}
                                {analysis.isPair && !analysis.isTriple && (
                                  <div className="text-green-300 font-bold">
                                    ✅ PAIR MATCH!
                                  </div>
                                )}
                                {analysis.matches.map((match, i) => (
                                  <div key={i} className="flex justify-between">
                                    <span className="text-gray-300">
                                      {match.count}x {match.emoji}
                                    </span>
                                    <span className="text-green-200">
                                      {match.symbol}
                                    </span>
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
                          {format.compact}
                        </div>
                        <div className="text-sm text-purple-300 mb-2">
                          {format.detailed}
                        </div>
                        <div
                          className={`font-bold ${
                            currentDice.winnings > 0
                              ? "text-green-300"
                              : "text-red-300"
                          }`}
                        >
                          {format.winLoss}
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
                              // Access dice results in your code:
                            </div>
                            <div>
                              const currentDice =
                              DiceResultExamples.getCurrentDice(lastGameResult);
                            </div>
                            <div className="mt-2 text-yellow-300">
                              // Result object:
                            </div>
                            <pre>{JSON.stringify(currentDice, null, 2)}</pre>
                          </div>
                        </div>
                      </details>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* Enhanced Game History with Contract Data */}
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
                    onClick={() => loadContractHistory()}
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
                          {activity.dice.map((die, i) => (
                            <div key={i} className="text-center">
                              <div className="text-2xl">
                                {gameSymbols.find((s) => s.id === die)?.emoji ||
                                  "🎲"}
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
                              {activity.winnings - activity.totalBet > 0
                                ? "+"
                                : ""}
                              {(activity.winnings - activity.totalBet).toFixed(
                                4
                              )}{" "}
                              SUI
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
                            <span className="text-green-300">
                              Smart Contract Event
                            </span>
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
                          (activity) =>
                            activity.dice.join("") === game.dice.join("")
                        )
                    )
                    .map((game, index) => (
                      <motion.div
                        key={`local-${index}`}
                        className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay:
                            (gameState.contractHistory.length + index) * 0.02,
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
                      <div className="text-sm">
                        Loading blockchain history...
                      </div>
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
                        {
                          gameState.contractHistory.filter((a) => a.isWin)
                            .length
                        }
                      </div>
                      <div className="text-gray-400">Wins</div>
                    </div>
                    <div>
                      <div className="text-red-300 font-bold">
                        {Math.round(
                          (gameState.contractHistory.filter((a) => a.isWin)
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
          </div>
        </div>
      </div>
    </div>
  );
}
