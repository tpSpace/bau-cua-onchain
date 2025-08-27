"use client";

import { motion } from "framer-motion";
import { WalletButton } from "@/components/WalletButton";
import { FloatingParticles } from "@/components/FloatingParticles";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Dice1, Dice2, Dice3, Play, Star, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";

// Traditional Bau Cua Tom Ca symbols
const getGameSymbols = (t: (key: string) => string) => [
  { name: t("symbols.bau"), emoji: "🥒", color: "text-green-500" },
  { name: t("symbols.cua"), emoji: "🦀", color: "text-red-500" },
  { name: t("symbols.tom"), emoji: "🦐", color: "text-pink-500" },
  { name: t("symbols.ca"), emoji: "🐟", color: "text-blue-500" },
  { name: t("symbols.ga"), emoji: "🐓", color: "text-yellow-500" },
  { name: t("symbols.nai"), emoji: "🦌", color: "text-orange-500" },
];

export default function Home() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const gameSymbols = getGameSymbols(t);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-800 to-yellow-700 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat"
          animate={{
            backgroundPosition: ["0px 0px", "100px 100px"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Floating particles */}
      <FloatingParticles />

      {/* Header */}
      <motion.header
        className="relative z-10 flex justify-between items-center p-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            className="text-4xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            🎲
          </motion.div>
          <h1 className="text-2xl font-bold text-white">{t("home.title")}</h1>
        </motion.div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <WalletButton />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-red-300 to-pink-300 mb-6"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {t("home.title")}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-yellow-100 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t("home.subtitle")}
          </motion.p>

          <motion.p
            className="text-lg text-yellow-200 opacity-90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {t("home.description")}
          </motion.p>
        </motion.div>

        {/* Game Symbols */}
        <motion.div
          className="grid grid-cols-3 md:grid-cols-6 gap-8 mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {gameSymbols.map((symbol, index) => (
            <motion.div
              key={symbol.name}
              className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.6 + index * 0.1,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="text-4xl mb-2"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
              >
                {symbol.emoji}
              </motion.div>
              <span className={`text-lg font-semibold ${symbol.color}`}>
                {symbol.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Link href={`/${locale}/game`}>
            <motion.button
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xl px-12 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:shadow-yellow-400/50 cursor-pointer"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(251, 191, 36, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(251, 191, 36, 0.3)",
                  "0 0 40px rgba(251, 191, 36, 0.6)",
                  "0 0 20px rgba(251, 191, 36, 0.3)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Play className="w-6 h-6" />
              {t("common.playNow")}
              <Sparkles className="w-6 h-6" />
            </motion.button>
          </Link>

          <motion.div
            className="flex items-center gap-2 text-yellow-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <Star className="w-5 h-5 fill-current" />
            <span>{t("home.tagline")}</span>
            <Star className="w-5 h-5 fill-current" />
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          {[
            {
              icon: <Dice1 className="w-8 h-8" />,
              title: t("features.fair.title"),
              description: t("features.fair.description"),
            },
            {
              icon: <Dice2 className="w-8 h-8" />,
              title: t("features.fast.title"),
              description: t("features.fast.description"),
            },
            {
              icon: <Dice3 className="w-8 h-8" />,
              title: t("features.smooth.title"),
              description: t("features.smooth.description"),
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + index * 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="text-yellow-400 mb-4 flex justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-yellow-100 opacity-80">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Rules */}
      <motion.div
        className="mt-16 w-full max-w-4xl mx-auto text-left bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          {t("howToPlay.title")}
        </h2>
        <p className="text-yellow-100 opacity-90 mb-4">
          {t("howToPlay.description")}
        </p>
        <ul className="list-decimal ml-5 space-y-2 text-yellow-100/90">
          <li>{t("howToPlay.step1")}</li>
          <li>{t("howToPlay.step2")}</li>
          <li>{t("howToPlay.step3")}</li>
          <li>{t("howToPlay.step4")}</li>
          <li>
            {t("howToPlay.step5")}
            <a
              href="https://en.wikipedia.org/wiki/B%E1%BA%A7u_cua_c%C3%A1_c%E1%BB%8Dp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-200/90"
            >
              {" " + t("howToPlay.step5Link")}
            </a>
          </li>
        </ul>
        <p className="mt-4 text-yellow-200/90">{t("howToPlay.note")}</p>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="relative z-10 text-center py-8 text-yellow-200 opacity-70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <p>{t("footer.copyright")}</p>
      </motion.footer>
    </div>
  );
}
