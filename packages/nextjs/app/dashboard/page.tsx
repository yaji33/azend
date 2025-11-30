"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { Calendar, MapPin, TrendingUp, ShieldCheck, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import Navbar from "~~/components/Navbar";
import LoginModal from "~~/components/LoginModal";
import { EVENTS_DATA } from "~~/utils/mockEvents";

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  // Gatekeeper
  if (!isConnected) {
    return <div className="min-h-screen bg-[#020410]"><LoginModal isOpen={true} onClose={() => router.push("/")} /></div>;
  }

  // Filter Data: Get only Past events (History)
  const pastEvents = EVENTS_DATA.filter(e => e.status === "past" || [3, 5].includes(e.id));

  // Stats Data
  const stats = [
    { label: "Total Events", value: "12", icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "This Month", value: "3", icon: TrendingUp, color: "text-[#CFFF04]", bg: "bg-[#CFFF04]/10" },
    { label: "Cities Visited", value: "5", icon: MapPin, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Reputation Score", value: "847", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main 
      className="min-h-screen bg-[#021337] text-white font-sans selection:bg-[#CFFF04] selection:text-black"
      style={{
        background: "radial-gradient(circle at 50% 0%, rgba(16, 20, 50, 0.4) 0%, #020410 60%)"
      }}
    >
      <Navbar />

      <div className="max-w-[1100px] mx-auto px-6 md:px-12 pt-32 pb-20">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            My Dashboard
          </h1>
          <p className="text-gray-400">Your private attendance history and reputation score.</p>
        </div>

        {/* --- 1. ENHANCED STATS CARDS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden bg-[#111633]/40 border border-white/5 p-6 rounded-2xl group hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Background Glow */}
              <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${stat.bg}`} />
              
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              
              <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
              <p className="text-xs text-gray-400 mt-1 font-medium tracking-wide uppercase">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* --- 2. RECENT CHECK-INS --- */}
        <div className="flex items-center justify-between -mt-4 mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
             Events
          </h2>
          <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {pastEvents.length} Records found
          </span>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {pastEvents.map((event) => (
            <motion.div
              key={event.id}
              variants={itemVariants}
              onClick={() => router.push(`/dashboard/${event.id}`)} 
              className="group relative flex flex-col md:flex-row bg-[#111633]/30 border border-white/5 hover:border-[#CFFF04]/30 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:shadow-[#CFFF04]/5 hover:bg-[#111633]/50"
            >
              
              {/* Image Section */}
              <div className="w-full md:w-48 h-32 md:h-auto relative shrink-0 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#020410]/80 to-transparent" />
              </div>

              {/* Details Section */}
              <div className="flex-1 p-5 flex flex-col justify-center gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#CFFF04] transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {event.date}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {event.location.split(',')[0]}</span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5 bg-[#CFFF04]/10 border border-[#CFFF04]/20 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 size={14} className="text-[#CFFF04]" />
                    <span className="text-[10px] font-bold text-[#CFFF04] uppercase tracking-wider">Verified</span>
                  </div>
                </div>
              </div>

              {/* Action Area (Right Side) */}
              <div className="hidden md:flex w-16 items-center justify-center border-l border-white/5 text-gray-600 group-hover:bg-[#CFFF04] group-hover:text-black transition-all duration-300">
                <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </main>
  );
}