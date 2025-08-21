"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { motion } from "framer-motion";
import { Wallet, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

export function WalletButton() {
  const t = useTranslations("common");
  const currentAccount = useCurrentAccount();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex items-center gap-4"
    >
      {currentAccount ? (
        <motion.div
          className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Wallet className="w-5 h-5" />
          <span className="font-medium">
            {currentAccount.address.slice(0, 6)}...
            {currentAccount.address.slice(-4)}
          </span>
          <LogOut className="w-4 h-4 opacity-70" />
        </motion.div>
      ) : (
        <ConnectButton
          connectText={t("connectWallet")}
          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        />
      )}
    </motion.div>
  );
}
