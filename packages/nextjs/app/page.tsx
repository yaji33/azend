"use client";

import React, { useRef } from "react";
// 1. Import Navbar import Navbar from "~~/components/Navbar";
import { useRouter } from "next/navigation"; // 1. Import Router
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Lock, Fingerprint, Plus, QrCode } from "lucide-react";

// --- REUSABLE 3D CARD COMPONENT ---
const FloatCard = ({ children, className, style, delay = 0, depth = 1, mouseX, mouseY }: any) => {
  // Parallax Logic
  const x = useTransform(mouseX, [-0.5, 0.5], [-15 * depth, 15 * depth]);
  const y = useTransform(mouseY, [-0.5, 0.5], [-15 * depth, 15 * depth]);

  const springX = useSpring(x, { stiffness: 200, damping: 25 });
  const springY = useSpring(y, { stiffness: 200, damping: 25 });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 100 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        translateY: [0, -8, 0]
      }}
      transition={{ 
        duration: 0.8, 
        delay, 
        type: "spring", 
        bounce: 0.4,
        translateY: {
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 2
        }
      }}
      style={{ x: springX, y: springY, ...style }}
      whileHover={{ 
        scale: 1.1, 
        zIndex: 100, 
        rotate: 0,
        filter: "brightness(1.1)",
        transition: { duration: 0.3 } 
      }}
      className={`absolute shadow-[0_25px_60px_rgba(0,0,0,0.5)] ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // 2. Initialize the Router
  const router = useRouter(); 

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const width = rect.width;
      const height = rect.height;
      const mouseXFromCenter = e.clientX - rect.left - width / 2;
      const mouseYFromCenter = e.clientY - rect.top - height / 2;
      mouseX.set(mouseXFromCenter / width);
      mouseY.set(mouseYFromCenter / height);
    }
  };

  return (
    <main 
      className="min-h-screen relative overflow-hidden text-white font-sans selection:bg-[#CFFF04] selection:text-black"
      style={{
        background: "#021338"
      }}
      onMouseMove={handleMouseMove}
      ref={ref}
    >
     {/* <Navbar /> */}

      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-24 lg:pt-20 grid lg:grid-cols-2 gap-8 h-screen items-center relative z-10">
        
        {/* LEFT SIDE */}
        <div className="flex flex-col items-start justify-center h-full max-w-lg pointer-events-none pl-4">
          <motion.h1 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-7xl md:text-7xl font-bold leading-[1.05] mb-6 drop-shadow-2xl pointer-events-auto"
          >
            Smart events, <br />
            <span className="text-white">
              Safer check-ins.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-blue-100 text-lg mb-8 leading-relaxed drop-shadow-lg max-w-md pointer-events-auto"
          >
            Create private, secure events in minutes and Verify presence without revealing identities.
          </motion.p>

          {/* 3. THIS BUTTON TRIGGERS THE NAVIGATION */}
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            // 👇 THIS LINE SENDS YOU TO THE FILE YOU CREATED
            onClick={() => router.push("/eventz/create")} 
            className="text-[#131517] px-6 py-3 rounded-xl font-medium text-base transition-all hover:scale-110 pointer-events-auto"
            style={{
               background: "white"
            }}
          >
            Create Events
          </motion.button>
        </div>

        {/* RIGHT SIDE (3D Elements) - Kept exactly as your "100% Zoom" version */}
        <div className="relative h-[600px] w-full hidden lg:block perspective-[1500px]">
           {/* 1. JOIN US BUTTON */}
           <FloatCard depth={2.5} mouseX={mouseX} mouseY={mouseY} delay={0.6} className="bottom-10 right-[30%] z-50 bg-transparent shadow-none">
             <button className="bg-[#CFFF04] text-black px-8 py-3 rounded-full font-black text-xl shadow-[0_10px_30px_rgba(207,255,4,0.5)] rotate-[-2deg] hover:scale-105 transition-transform border-[3px] border-[#020410]">
               Join us
             </button>
          </FloatCard>
          
           {/* 2. TOP LEFT (User Group) */}
           <FloatCard depth={0.5} mouseX={mouseX} mouseY={mouseY} delay={0.1} className="top-12 left-10 z-20 bg-white text-black p-3.5 rounded-2xl w-52 rotate-[-4deg]">
          <p className="text-[10px] font-bold mb-2 text-gray-600">10k+ Join the event</p>
          
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2.5">
              
              {/* User 1: Blue Encrypted Identity */}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-sm">
                <Lock size={12} strokeWidth={2.5} />
              </div>

              {/* User 2: Purple Biometric Identity */}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-sm">
                <Fingerprint size={14} strokeWidth={2.5} />
              </div>

              {/* User 3: Teal Anonymous Identity */}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-sm">
                {/* Simple User Icon representing anonymity */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>

            </div>
            
            {/* Plus Indicator */}
            <div className="w-8 h-8 rounded-full bg-[#CFFF04] flex items-center justify-center shadow-md">
              <Plus size={16} className="text-black stroke-[3px]"/>
            </div>
          </div>
        </FloatCard>

          {/* 3. TOP RIGHT (Art Fair) */}
          <FloatCard depth={0.8} mouseX={mouseX} mouseY={mouseY} delay={0.2} className="top-8 right-16 z-10 w-36 h-36 bg-[#1A1A1A] rounded-2xl overflow-hidden rotate-[6deg] border border-white/10">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253440-b39345208668?q=80&w=400')] bg-cover bg-center opacity-60 mix-blend-overlay" />
            <div className="absolute top-2 left-2 text-[9px] text-gray-400 font-mono">21/09</div>
            <div className="absolute bottom-3 right-3 text-right">
              <h3 className="text-white font-serif font-medium text-2xl leading-none tracking-tight">Art<br/>Fair</h3>
            </div>
            <div className="absolute bottom-4 left-4 bg-[#CFFF04] w-8 h-8 rounded-full flex items-center justify-center border-[2px] border-[#020410] z-20">
               <Plus size={14} className="text-black" />
            </div>
          </FloatCard>

          {/* 4. MIDDLE (Face Scan) */}
          <FloatCard depth={1.2} mouseX={mouseX} mouseY={mouseY} delay={0.3} className="top-32 right-[150px] z-30 w-56 h-66 bg-gray-900 rounded-2xl overflow-hidden border border-white/20">
             <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=500" className="w-full h-full object-cover opacity-80" />
             <motion.div animate={{ y: [-100, 250, -100] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute top-0 left-0 w-full h-[2px] bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,1)] z-10" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-blue-500/50 flex items-center justify-center bg-blue-500/10 backdrop-blur-[1px]">
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-blue-500"></div>
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-blue-500"></div>
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-blue-500"></div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-blue-500"></div>
             </div>
             <div className="absolute top-[40%] left-2 bg-[#CFFF04] w-7 h-7 rounded-full flex items-center justify-center border-[2px] border-[#020410]">
               <Plus size={14} className="text-black" />
             </div>
          </FloatCard>

          {/* 5. SCAN ME (Pill & Arrow) */}
          <FloatCard depth={1.2} mouseX={mouseX} mouseY={mouseY} delay={0.5} className="top-[38%] left-[60px] z-30 flex flex-col items-center bg-transparent shadow-none">
             <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="bg-[#CFFF04] text-black font-extrabold text-lg px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(207,255,4,0.6)] rotate-[-4deg] mb-1 border-[3px] border-[#020410]">Scan Me</motion.div>
             <div className="w-24 h-24 -ml-14 -mt-2"><svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-xl"><path d="M70 10 C 10 10, 0 60, 30 90" stroke="#CFFF04" strokeWidth="4" strokeLinecap="round" /><path d="M15 80 L 30 90 L 45 75" stroke="#CFFF04" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          </FloatCard>

          {/* 6. BOTTOM RIGHT (Club Ticket) - Fixed Rounding */}
          <FloatCard depth={2} mouseX={mouseX} mouseY={mouseY} delay={0.4} className="top-[48%] right-4 z-40 w-52 h-52 bg-white rounded-lg rotate-[8deg] overflow-hidden shadow-xl">
             <div className="w-full h-full relative flex flex-col justify-between">
                
                {/* Background Texture */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10"></div>
                
                {/* Top Content (With Padding) */}
                <div className="relative z-10 p-4">
                   <div className="flex justify-between items-start mb-1">
                      <div className="w-8 h-8 border-2 border-black rounded-lg flex items-center justify-center font-bold text-[10px] text-black bg-white">atl</div>
                      <div className="bg-[#CFFF04] w-9 h-9 rounded-full flex items-center justify-center shadow-sm"><Plus size={18} className="text-black" /></div>
                   </div>
                   
                   <div className="text-center">
                      <h1 className="text-6xl font-black text-black tracking-tighter scale-y-110">Club</h1>
                   </div>
                </div>

                {/* Footer (Flush to bottom, no padding on sides) */}
                <div className="relative z-10 p-4 py-5" style={{ background: "linear-gradient(90deg, #02B8E0 0%, #344DED 100%)" }}>
                   <p className="font-bold text-3xl text-white leading-none">20.06</p>
                   <p className="text-[9px] uppercase text-white/90 mt-1 font-medium tracking-wide">MeMachine / Marcelo Kaz</p>
                </div>
             </div>
          </FloatCard>

          {/* 7. BOTTOM LEFT (QR Code) */}
          <FloatCard depth={1.8} mouseX={mouseX} mouseY={mouseY} delay={0.5} className="bottom-[12%] left-[100px] z-20 w-40 h-40 bg-white p-2.5 rounded-[20px] rotate-[-6deg]">
            <div className="w-full h-full border-[2.5px] border-black rounded-[16px] flex items-center justify-center relative bg-white">
               <QrCode size={80} strokeWidth={1.5} className="text-black" />
               <div className="absolute -bottom-3 -right-3 bg-[#CFFF04] w-10 h-10 rounded-full flex items-center justify-center border-[3px] border-[#020410] shadow-lg"><Plus size={20} className="text-black" /></div>
            </div>
          </FloatCard>

          {/* --- DIAMOND ICONS (Stars) --- */}
          {/* Top Center */}
          <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute top-[10%] left-[50%] text-white text-3xl drop-shadow-[0_0_10px_white] z-10">✦</motion.div>
          
          {/* Top Right (Near Art Fair) */}
          <motion.div animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="absolute top-[5%] right-[20%] text-white text-4xl drop-shadow-[0_0_10px_white] z-10">✦</motion.div>
          
          {/* Bottom Left (Near QR) */}
          <motion.div animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 4, delay: 1 }} className="absolute bottom-[25%] left-[10%] text-[#CFFF04] text-3xl drop-shadow-[0_0_8px_#CFFF04] z-10">✦</motion.div>
          
          {/* Bottom Right (Near Join) */}
          <motion.div animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ repeat: Infinity, duration: 2.5, delay: 1.5 }} className="absolute bottom-[10%] right-[10%] text-white text-2xl z-10">✦</motion.div>
        
        </div>
      </div>
    </main>
  );
}