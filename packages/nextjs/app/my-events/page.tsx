"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "../../components/LoginModal";
import Navbar from "../../components/Navbar";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Calendar, CheckCircle, Loader2, MapPin, User, Users } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { AZEND_EVENT_ABI, EVENT_FACTORY_ABI, EVENT_FACTORY_ADDRESS } from "~~/contracts/config";

const MyEventCard = ({
  address,
  userAddress,
  activeTab,
}: {
  address: string;
  userAddress: string;
  activeTab: "upcoming" | "past";
}) => {
  const router = useRouter();

  // ALL HOOKS AT THE TOP - NO CONDITIONAL RETURNS BEFORE HOOKS
  const { data: hasAttended } = useReadContract({
    address: address as `0x${string}`,
    abi: AZEND_EVENT_ABI,
    functionName: "hasAttended",
    args: [userAddress as `0x${string}`],
  });

  const { data: isApproved } = useReadContract({
    address: address as `0x${string}`,
    abi: AZEND_EVENT_ABI,
    functionName: "isApproved",
    args: [userAddress as `0x${string}`],
  });

  const { data: hasRequested } = useReadContract({
    address: address as `0x${string}`,
    abi: AZEND_EVENT_ABI,
    functionName: "hasRequested",
    args: [userAddress as `0x${string}`],
  });

  const { data: eventData } = useReadContract({
    address: address as `0x${string}`,
    abi: AZEND_EVENT_ABI,
    functionName: "getEventDetails",
  });

  const { data: bannerHash } = useReadContract({
    address: address as `0x${string}`,
    abi: AZEND_EVENT_ABI,
    functionName: "bannerIpfsHash",
  });

  const { data: totalAttendeesPlain } = useReadContract({
    address: address as `0x${string}`,
    abi: AZEND_EVENT_ABI,
    functionName: "getTotalAttendeesPlain",
  });

  const { data: organizer } = useReadContract({
    address: address as `0x${string}`,
    abi: AZEND_EVENT_ABI,
    functionName: "organizer",
  });

  // NOW do conditional logic AFTER all hooks
  const attended = Boolean(hasAttended);
  const approved = Boolean(isApproved);
  const requested = Boolean(hasRequested);

  const hasInteraction = attended || approved || requested;
  if (!hasInteraction) return null;
  if (activeTab === "upcoming" && attended) return null;
  if (activeTab === "past" && !attended) return null;
  if (!eventData) return null;

  const [name, description, location, , startTime, , capacity] = eventData;

  // Filter: show in "upcoming" if not attended, "past" if attended
  if (activeTab === "upcoming" && attended) return null;
  if (activeTab === "past" && !attended) return null;

  const startUnix = Number(startTime);
  const dateObj = startUnix > 0 ? new Date(startUnix * 1000) : new Date();
  const month = format(dateObj, "MMM").toUpperCase();
  const day = format(dateObj, "d");

  const bannerUrl = bannerHash
    ? `https://gateway.pinata.cloud/ipfs/${bannerHash}`
    : "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200";

  const attendeeCount = totalAttendeesPlain ? Number(totalAttendeesPlain) : 0;
  const capacityNum = Number(capacity);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={itemVariants}
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.03)" }}
      onClick={() => router.push(`/eventz/${address}`)}
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
          src={bannerUrl}
          alt={String(name)}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
            activeTab === "past" ? "grayscale opacity-60" : "group-hover:scale-110"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020410]/80 to-transparent md:hidden" />
      </div>

      {/* DETAILS */}
      <div className="flex-1 p-6 flex flex-col justify-center gap-3 relative">
        <h2 className="text-2xl font-bold group-hover:text-blue-400 transition-colors line-clamp-1">{String(name)}</h2>

        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <User size={16} className="text-blue-500 shrink-0" />
            <span className="truncate">
              Hosted by{" "}
              <span className="text-gray-300 font-mono">
                {organizer ? `${String(organizer).slice(0, 6)}...${String(organizer).slice(-4)}` : "Unknown"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-500 shrink-0" />
            <span className="truncate">{String(location)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-500 shrink-0" />
            <span>
              {attendeeCount} / {capacityNum} attendees
            </span>
          </div>
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
        <span className="text-sm font-medium tracking-widest text-gray-400 mb-1">{month}</span>
        <span className="text-5xl font-bold text-white tracking-tighter">{day}</span>
      </div>

      <div className="md:hidden absolute top-4 left-4 bg-white/10 backdrop-blur-md text-white rounded-lg p-2 text-center border border-white/10 font-bold leading-tight z-10">
        <span className="text-xs block opacity-80">{month}</span>
        <span className="text-xl">{day}</span>
      </div>
    </motion.div>
  );
};

export default function MyEventsPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch all events to check which ones user has attended
  const { data: allEvents, isLoading } = useReadContract({
    address: EVENT_FACTORY_ADDRESS,
    abi: EVENT_FACTORY_ABI,
    functionName: "getAllEvents",
  });

  if (!isMounted) return null;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#020410]">
        <LoginModal isOpen={true} onClose={() => router.push("/")} />
      </div>
    );
  }

  const eventList = allEvents ? ([...allEvents].reverse() as string[]) : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <main
      className="min-h-screen bg-[#020410] text-white font-sans selection:bg-[#CFFF04] selection:text-black"
      style={{
        background: "radial-gradient(circle at 50% 0%, rgba(28,96,255,0.1) 0%, rgba(2,4,16,1) 60%)",
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
            {["upcoming", "past"].map(tab => (
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
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#CFFF04] animate-spin" />
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
            <AnimatePresence mode="popLayout">
              {eventList.length > 0 ? (
                eventList.map(eventAddress => (
                  <MyEventCard key={eventAddress} address={eventAddress} userAddress={address!} activeTab={activeTab} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5"
                >
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-gray-500" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No {activeTab} events found</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {activeTab === "upcoming"
                      ? "Browse events and purchase tickets to get started"
                      : "Attend events to build your history"}
                  </p>
                  <button onClick={() => router.push("/eventz")} className="text-[#CFFF04] hover:underline text-sm">
                    Explore Events
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  );
}
