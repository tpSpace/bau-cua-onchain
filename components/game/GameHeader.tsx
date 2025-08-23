"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Home, Coins } from "lucide-react";
import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface GameHeaderProps {
  isConnected: boolean;
  totalBalance: number;
  bankBalance: number | null;
}

export function GameHeader({
  isConnected,
  totalBalance,
  bankBalance,
}: GameHeaderProps) {
  const t = useTranslations();

  return (
    <motion.header
      className="flex justify-between items-center p-6 relative z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-4">
        <Link href="/">
          <motion.button
            className="flex items-center gap-2 text-white hover:text-yellow-300 transition-colors cursor-pointer"
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
          {bankBalance !== null && (
            <span className="text-sm text-yellow-200 ml-2">
              (Bank: {bankBalance.toFixed(2)} SUI)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <WalletButton />
      </div>
    </motion.header>
  );
}
