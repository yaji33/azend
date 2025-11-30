"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Clock, Shield, BarChart3, Download, CheckCircle2 } from "lucide-react";
import Navbar from "../../../../components/Navbar";
import LoginModal from "../../../../components/LoginModal";
import { EVENTS_DATA } from "../../../../utils/mockEvents";

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;
  
  // Gatekeeper
  if (!isConnected) {
    return <div className="min-h-screen bg-[#021337]"><LoginModal isOpen={true} onClose={() => router.push("/")} /></div>;
  }

  const event = EVENTS_DATA.find((e) => e.id.toString() === params.id);
  if (!event) return <div className="min-h-screen flex items-center justify-center text-white">Event not found</div>;

  // --- MOCK DATA ---
  const chartData = [
    { time: "9 AM", val: 15 }, { time: "10 AM", val: 25 }, { time: "11 AM", val: 35 },
    { time: "12 PM", val: 50 }, { time: "1 PM", val: 65 }, { time: "2 PM", val: 80 },
    { time: "3 PM", val: 90 }, { time: "4 PM", val: 95 }, { time: "5 PM", val: 100 }
  ];

  const statsCards = [
    { label: "Total Attendees", value: event.attendees.toString(), sub: "65% Capacity", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Check-Ins Today", value: "842", sub: "+12% vs avg", icon: BarChart3, color: "text-[#CFFF04]", bg: "bg-[#CFFF04]/10" },
    { label: "Avg Dwell Time", value: "4.2 hrs", sub: "Per attendee", icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Privacy Score", value: "100%", sub: "Zero-Knowledge", icon: Shield, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  return (
    <main 
      className="min-h-screen bg-[#021337] text-white font-sans selection:bg-[#CFFF04] selection:text-black"
      style={{
        background: "radial-gradient(circle at 50% 0%, rgba(16, 20, 50, 0.4) 0%, #020410 60%)"
      }}
    >
      <Navbar />

      <div className="max-w-[1100px] mx-auto px-6 md:px-12 pt-32 pb-20">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="group flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> 
          Back to Event Details
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.title}</h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="w-2 h-2 bg-[#CFFF04] rounded-full animate-pulse"></span>
                Real-time analytics with privacy preservation
            </div>
          </div>
          <button className="bg-white hover:bg-blue-500 text-black px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 hover:scale-105">
            <Download size={18} /> Export Report
          </button>
        </div>

        {/* --- 1. STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#111633]/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <h3 className="text-3xl font-bold tracking-tight mb-1">{stat.value}</h3>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{stat.label}</p>
              <div className="absolute top-6 right-6">
                 <span className={`text-[10px] px-2 py-1 rounded-full border border-white/5 bg-black/20 ${stat.color}`}>{stat.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- 2. FULL WIDTH CHART SECTION (Ticket Breakdown Removed) --- */}
        <div className="bg-[#111633]/30 border border-white/10 rounded-2xl p-8 backdrop-blur-sm mb-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold">Attendance Over Time</h2>
                <div className="flex gap-2">
                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs px-3 py-1.5 text-gray-300 transition-colors">Live</button>
                    <button className="bg-[#CFFF04] text-black border border-[#CFFF04] rounded-lg text-xs px-3 py-1.5 font-bold transition-colors">Total</button>
                </div>
            </div>
            
            <div className="space-y-6">
                {chartData.map((data, index) => (
                <div key={index} className="flex items-center gap-6 group">
                    <span className="text-xs text-gray-500 w-12 text-right font-mono">{data.time}</span>
                    <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden relative">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${data.val}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-blue-600 to-[#CFFF04] rounded-full group-hover:brightness-125 transition-all relative overflow-hidden"
                        >
                            {/* Shine Effect */}
                            <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        </motion.div>
                    </div>
                    <span className="text-xs text-white font-bold w-12 text-right opacity-60 group-hover:opacity-100 transition-opacity">
                        {data.val}%
                    </span>
                </div>
                ))}
            </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-6 border border-emerald-500/20 rounded-2xl bg-[#111633]/20 flex items-start gap-4">
           <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
             <Shield size={20} />
           </div>
           <div>
             <h4 className="font-bold text-sm text-white mb-1">Privacy-Preserving Analytics</h4>
             <p className="text-xs text-gray-400 leading-relaxed max-w-4xl -mt-1 -mb-2">
               All metrics are computed using homomorphic encryption on encrypted data. Individual attendee information remains private and encrypted on-chain. Only aggregate statistics are decrypted and displayed to organizers. No PII (Personally Identifiable Information) is ever exposed.
             </p>
           </div>
        </div>

      </div>
    </main>
  );
}