"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import ThreeDLockIcon from "./ThreeDLockIcon"; // Import the new icon

interface ConnectLockProps {
  onClose?: () => void;
}

export default function ConnectLock({ onClose }: ConnectLockProps) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 overflow-hidden bg-[#020410]">
      
      {/* Background Ambience (Orbs & Grid) */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }}
      />
      <motion.div 
        animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"
      />

      {/* --- MAIN CARD --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
        className="relative z-10 w-full max-w-md bg-[#111633]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        {/* Optional X Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full p-2"
          >
            <X size={20} />
          </button>
        )}

        {/* 1. THE NEW 3D ICON */}
        <div className="mb-6">
          <ThreeDLockIcon />
        </div>

        {/* Title */}
        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
          Welcome to Azend
        </h2>

        {/* Subtitle */}
        <p className="text-gray-300 mb-10 text-sm leading-relaxed max-w-xs">
          Connect your wallet to create events, manage tickets, and verify attendees securely.
        </p>

        {/* Custom Connect Button */}
        <div className="w-full">
          <ConnectButton.Custom>
            {({ openConnectModal, mounted }) => {
              if (!mounted) return null;
              
              return (
                <button
                  onClick={openConnectModal}
                  className="w-60 text-[#020410] py-2 rounded-xl font-medium text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(207,255,4,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all bg-white hover:bg-[#CFFF04]"
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