"use client";

import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";

export default function ThreeDLockIcon() {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center perspective-[800px]">
      
      {/* THE 3D CUBE */}
      <motion.div
        className="relative w-20 h-20"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ 
          rotateY: [0, 360], 
          rotateX: [10, -10, 10], // Slight tilt for 3D feel
          y: [-10, 10, -10]       // Floating bob
        }}
        transition={{ 
          rotateY: { duration: 15, repeat: Infinity, ease: "linear" },
          rotateX: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        
        {/* --- FRONT FACE (The Lock) --- */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-purple-900/80 border border-[#CFFF04]/50 rounded-xl flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(207,255,4,0.3)]"
          style={{ transform: "translateZ(40px)" }}
        >
          <Lock className="text-white drop-shadow-md" size={40} />
          {/* Shiny reflection line */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-xl" />
        </div>

        {/* --- BACK FACE --- */}
        <div 
          className="absolute inset-0 bg-[#111633]/90 border border-white/10 rounded-xl flex items-center justify-center"
          style={{ transform: "rotateY(180deg) translateZ(40px)" }}
        >
          <ShieldCheck className="text-blue-400" size={32} />
        </div>

        {/* --- RIGHT FACE --- */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#020410] to-[#111633] border border-white/10 rounded-xl opacity-90"
          style={{ transform: "rotateY(90deg) translateZ(40px)" }}
        />

        {/* --- LEFT FACE --- */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#020410] to-[#111633] border border-white/10 rounded-xl opacity-90"
          style={{ transform: "rotateY(-90deg) translateZ(40px)" }}
        />

        {/* --- TOP FACE --- */}
        <div 
          className="absolute inset-0 bg-[#CFFF04]/20 border border-[#CFFF04]/30 rounded-xl"
          style={{ transform: "rotateX(90deg) translateZ(40px)" }}
        />

        {/* --- BOTTOM FACE --- */}
        <div 
          className="absolute inset-0 bg-[#020410] border border-white/10 rounded-xl shadow-xl"
          style={{ transform: "rotateX(-90deg) translateZ(40px)" }}
        />

      </motion.div>

      {/* Floor Shadow (Adds realism) */}
      <motion.div 
        animate={{ scale: [1, 0.8, 1], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 w-20 h-4 bg-black/60 blur-xl rounded-[100%] transform rotate-x-60"
      />
      
    </div>
  );
}