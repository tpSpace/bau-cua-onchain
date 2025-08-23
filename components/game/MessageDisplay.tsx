"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Wallet } from "lucide-react";

interface MessageDisplayProps {
  isConnected: boolean;
  error: string | null;
  successMessage: string;
  onClearError: () => void;
}

export function MessageDisplay({
  isConnected,
  error,
  successMessage,
  onClearError,
}: MessageDisplayProps) {
  return (
    <>
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
      {error && (
        <motion.div
          className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/20 border border-red-400/30 rounded-xl flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-100">{error}</p>
          <button
            onClick={onClearError}
            className="ml-auto text-red-400 hover:text-red-300 cursor-pointer"
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
    </>
  );
}
