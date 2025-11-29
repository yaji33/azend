"use client";

import { X } from "lucide-react";
import ConnectLock from "../components/ConnectLock";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-[1010] text-white/40 hover:text-white transition-colors bg-black/10 hover:bg-black/30 rounded-full p-1"
        >
          <X size={22} />
        </button>
      {/* 1. Dark Backdrop (Click to dismiss) */}
      <div 
        className="absolute inset-0 bg-[#020410]/95 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* 2. Wrapper for Content + X Button */}
      <div className="relative z-[1000] w-full max-w-md">

        

        {/* The Lock Content */}
        <ConnectLock />
      </div>

    </div>
  );
}