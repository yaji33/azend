"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, Calendar, User, CheckCircle, ArrowRight } from "lucide-react";
import Navbar from "../../components/Navbar";
import LoginModal from "../../components/LoginModal";
import { EVENTS_DATA } from "../../utils/mockEvents"; // Ensure this path is correct

export default function MyEventsPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // --- GATEKEEPER ---
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#020410]">
        <LoginModal isOpen={true} onClose={() => router.push("/")} />
      </div>
    );
  }

  // --- DATA FILTERING ---
  // Simulating "My Events" by IDs
  const myUpcomingEvents = EVENTS_DATA.filter(e => [1, 2, 4].includes(e.id));
  const myPastEvents = EVENTS_DATA.filter(e => [3, 5].includes(e.id));
  const filteredEvents = activeTab === "upcoming" ? myUpcomingEvents : myPastEvents;

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Helper for Date Display
  const getDateParts = (dateString: string) => {
    const parts = dateString.split(" ");
    return {
      month: parts[0].substring(0, 3).toUpperCase(),
      day: parts[1].replace(",", "").split("-")[0]
    };
  };

  return (
    <main 
      className="min-h-screen bg-[#020410] text-white font-sans selection:bg-[#CFFF04] selection:text-black"
      style={{
        background: "radial-gradient(circle at 50% 0%, rgba(28,96,255,0.1) 0%, rgba(2,4,16,1) 60%)"
      }}
    >
      <Navbar />

      <div className="max-w-[1100px] mx-auto px-6 md:px-12 pt-32 pb-20">
        
        {/* HEADER & TABS */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Events</h1>
            <p className="text-gray-400 text-sm max-w-md">
              {activeTab === "upcoming" 
                ? "Manage tickets and view your schedule." 
                : "History of events you successfully attended."}
            </p>
          </div>

          <div className="flex gap-8 mt-6 md:mt-0 relative">
            {["upcoming", "past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-sm font-medium pb-4 relative transition-colors ${
                  activeTab === tab ? "text-[#CFFF04]" : "text-gray-500 hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabLine" 
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#CFFF04]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* EVENTS LIST */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const dateParts = getDateParts(event.date);

                return (
                  <motion.div
                    key={event.id}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.03)" }}
                    // --- CLICKABLE ROUTE ---
                    onClick={() => router.push(`/eventz/${event.id}`)} 
                    className="group relative flex flex-col md:flex-row bg-[#111633]/30 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all cursor-pointer shadow-lg min-h-[220px]"
                  >
                    
                    {/* PAST EVENT BADGE */}
                    {activeTab === "past" && (
                      <div className="absolute top-0 right-0 z-20 bg-[#CFFF04] text-black text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg flex items-center gap-1.5">
                        <CheckCircle size={14} /> Thank you for joining!
                      </div>
                    )}

                    {/* IMAGE */}
                    <div className="w-full md:w-[280px] h-48 md:h-auto shrink-0 relative overflow-hidden bg-black">
                      <img 
                        src={event.image} 
                        alt={event.title} 
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${activeTab === 'past' ? 'grayscale opacity-60' : 'group-hover:scale-110'}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#020410]/80 to-transparent md:hidden" />
                    </div>

                    {/* DETAILS */}
                    <div className="flex-1 p-6 flex flex-col justify-center gap-3 relative">
                      <h2 className="text-2xl font-bold group-hover:text-blue-400 transition-colors line-clamp-1">
                        {event.title}
                      </h2>
                      
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2"><User size={16} className="text-blue-500 shrink-0" /><span className="truncate">Hosted by <span className="text-gray-300">{event.host}</span></span></div>
                        <div className="flex items-center gap-2"><MapPin size={16} className="text-blue-500 shrink-0" /><span className="truncate">{event.location}</span></div>
                        <div className="flex items-center gap-2"><Users size={16} className="text-blue-500 shrink-0" /><span>{event.attendees} / {event.capacity} attendees</span></div>
                      </div>

                      {activeTab === "past" ? (
                          <div className="mt-2 text-xs text-[#CFFF04] font-medium flex items-center gap-2">
                              <CheckCircle size={12} /> Verified Attendee
                          </div>
                      ) : (
                          <div className="mt-2 text-xs text-blue-300 font-medium flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                              View Ticket <ArrowRight size={12} />
                          </div>
                      )}
                    </div>

                    {/* DATE */}
                    <div className="hidden md:flex flex-col justify-center items-center w-40 border-l border-white/10 bg-white/5 group-hover:bg-white/10 transition-colors shrink-0">
                      <span className="text-sm font-medium tracking-widest text-gray-400 mb-1">{dateParts.month}</span>
                      <span className="text-5xl font-bold text-white tracking-tighter">{dateParts.day}</span>
                    </div>

                    <div className="md:hidden absolute top-4 left-4 bg-white/10 backdrop-blur-md text-white rounded-lg p-2 text-center border border-white/10 font-bold leading-tight z-10">
                      <span className="text-xs block opacity-80">{dateParts.month}</span>
                      <span className="text-xl">{dateParts.day}</span>
                    </div>

                  </motion.div>
                );
              })
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"><Calendar className="text-gray-500" size={32} /></div>
                <h3 className="text-lg font-bold text-white">No {activeTab} events found</h3>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}