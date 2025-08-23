"use client";

import {
  ConnectModal,
  useCurrentAccount,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { motion } from "framer-motion";
import { Wallet, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function WalletButton() {
  const t = useTranslations("common");
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex items-center gap-3"
    >
      <ConnectModal
        open={open}
        onOpenChange={setOpen}
        trigger={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow cursor-pointer"
          >
            {currentAccount ? "Change Wallet" : t("connectWallet")}
          </button>
        }
      />

      {currentAccount && (
        <button
          type="button"
          onClick={() => disconnect()}
          className="flex items-center gap-2 border border-white/20 text-white px-3 py-2 rounded-lg text-sm hover:bg-white/10 cursor-pointer"
        >
          <Wallet className="w-4 h-4" />
          <span className="font-medium">
            {currentAccount.address.slice(0, 6)}...
            {currentAccount.address.slice(-4)}
          </span>
          <LogOut className="w-4 h-4 opacity-80" />
        </button>
      )}
    </motion.div>
  );
}
