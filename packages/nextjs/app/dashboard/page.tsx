"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Loader2, MapPin, Plus, ShieldCheck, TrendingUp } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { DashboardEventCard } from "~~/components/DashboardEventCard";
import LoginModal from "~~/components/LoginModal";
import Navbar from "~~/components/Navbar";
import { EVENT_FACTORY_ABI, EVENT_FACTORY_ADDRESS } from "~~/contracts/config";

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: myEvents, isLoading } = useReadContract({
    address: EVENT_FACTORY_ADDRESS,
    abi: EVENT_FACTORY_ABI,
    functionName: "getEventsByOrganizer",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const eventList = myEvents ? ([...myEvents].reverse() as string[]) : [];

  const stats = [
    {
      label: "Events Hosted",
      value: eventList.length.toString(),
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Engagement",
      value: eventList.length > 0 ? "High" : "-",
      icon: TrendingUp,
      color: "text-[#CFFF04]",
      bg: "bg-[#CFFF04]/10",
    },
    {
      label: "Network Status",
      value: "Sepolia",
      icon: MapPin,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "Reputation Score",
      value: (eventList.length * 50).toString(),
      icon: ShieldCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (!isMounted) return null;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#020410]">
        <LoginModal isOpen={true} onClose={() => router.push("/")} />
      </div>
    );
  }

  return (
    <main
      className="min-h-screen bg-[#021337] text-white font-sans selection:bg-[#CFFF04] selection:text-black"
      style={{
        background: "radial-gradient(circle at 50% 0%, rgba(16, 20, 50, 0.4) 0%, #020410 60%)",
      }}
    >
      <Navbar />

      <div className="max-w-[1100px] mx-auto px-6 md:px-12 pt-32 pb-20">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Organizer Dashboard
            </h1>
            <p className="text-gray-400">Manage your privacy-preserving events.</p>
          </div>
          <button
            onClick={() => router.push("/eventz/create")}
            className="hidden md:flex items-center gap-2 bg-[#CFFF04] hover:bg-[#bce600] text-black font-bold px-5 py-2.5 rounded-xl transition-all"
          >
            <Plus size={18} /> Create Event
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden bg-[#111633]/40 border border-white/5 p-6 rounded-2xl group hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${stat.bg}`}
              />
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
              <p className="text-xs text-gray-400 mt-1 font-medium tracking-wide uppercase">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between -mt-4 mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">Your Events</h2>
          <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {eventList.length} Records found
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#CFFF04] animate-spin" />
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
            {eventList.length > 0 ? (
              eventList.map(address => <DashboardEventCard key={address} address={address} variants={itemVariants} />)
            ) : (
              <div className="text-center py-16 bg-[#111633]/30 rounded-2xl border border-white/5">
                <p className="text-gray-400 mb-4">You haven&apos;t created any events yet.</p>
                <button
                  onClick={() => router.push("/eventz/create")}
                  className="text-[#CFFF04] underline hover:text-white transition-colors"
                >
                  Create your first event
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}
