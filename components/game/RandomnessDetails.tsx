"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Shuffle, Hash, ExternalLink, Info } from "lucide-react";
import { getSymbolByContractIndex } from "@/types/game";
import type { RandomnessDetails as RandomnessDetailsType } from "@/types/game";

interface RandomnessDetailsProps {
  randomnessDetails: RandomnessDetailsType;
}

export function RandomnessDetails({
  randomnessDetails,
}: RandomnessDetailsProps) {
  const [showRandomDetails, setShowRandomDetails] = useState(false);

  if (
    !randomnessDetails.rawNumbers ||
    randomnessDetails.rawNumbers.length === 0
  ) {
    return null;
  }

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Randomness Details</h3>
        <button
          onClick={() => setShowRandomDetails(!showRandomDetails)}
          className="text-yellow-300 hover:text-yellow-200 transition-colors cursor-pointer"
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
                <div className="text-2xl">{randomnessDetails.emojis?.[i]}</div>
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
                <span className="text-blue-200">0-5 (inclusive)</span>
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
                const symbol = getSymbolByContractIndex(num);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-white/5 rounded px-3 py-2"
                  >
                    <span className="font-mono text-green-200">{num}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-green-200">
                      {symbol?.englishName} ({symbol?.vietnameseName})
                    </span>
                    <span className="text-2xl">{symbol?.emoji}</span>
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
                    className="text-purple-300 hover:text-purple-200 font-mono text-sm underline cursor-pointer"
                  >
                    {randomnessDetails.transactionDigest?.slice(0, 8)}...
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
  );
}
