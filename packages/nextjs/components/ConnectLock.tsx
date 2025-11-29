"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LogIn } from "lucide-react";
import { motion } from "framer-motion";

export default function ConnectLock() {
  return (
    <div 
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{
        background: "#021338"
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md bg-[#111633]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-10 flex flex-col items-center text-center shadow-2xl"
      >
        {/* Icon Circle */}
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
          <LogIn size={32} className="text-black ml-1" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-3">
          Welcome to Azend
        </h2>

        {/* Subtitle */}
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          Connect your wallet to create events, manage tickets, and verify attendees securely.
        </p>

        {/* Custom Connect Button Wrapper */}
        <div className="w-full">
          <ConnectButton.Custom>
            {({ openConnectModal, mounted }) => {
              if (!mounted) return null;
              
              return (
                <button
                  onClick={openConnectModal}
                  className="w-full text-[#131517] py-4 rounded-lg font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                  style={{
                    background: "white"
                  }}
                >
                  Connect Wallet
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>

      </motion.div>
    </div>
  );
}