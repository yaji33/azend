"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, Loader2, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { EventCard } from "~~/components/EventCard";
import { FeaturedCarousel } from "~~/components/FeaturedCarousel";
import LoginModal from "~~/components/LoginModal";
import Navbar from "~~/components/Navbar";
import { EVENT_FACTORY_ABI, EVENT_FACTORY_ADDRESS } from "~~/contracts/config";

export default function ExploreEvents() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  const { data: eventAddresses, isLoading: isListLoading } = useReadContract({
    address: EVENT_FACTORY_ADDRESS,
    abi: EVENT_FACTORY_ABI,
    functionName: "getAllEvents",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#020410]">
        <LoginModal isOpen={true} onClose={() => router.push("/")} />
      </div>
    );
  }
  const eventList = eventAddresses ? ([...eventAddresses].reverse() as string[]) : [];
  return (
    <main className="min-h-screen bg-[#020410] text-white font-sans selection:bg-[#CFFF04] selection:text-black">
      <Navbar />
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#111633] border border-white/10 p-8 rounded-2xl w-full max-w-lg shadow-2xl z-[210]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Filter size={20} className="text-[#CFFF04]" /> Filter Events
                </h3>
                <button onClick={() => setIsFilterOpen(false)} className="hover:text-red-400">
                  <X size={24} />
                </button>
              </div>

              <div className="text-gray-400 text-sm text-center py-8">
                Advanced filtering requires The Graph integration (Post-MVP).
                <br />
                Currently showing all {eventList.length} events on-chain.
              </div>

              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-blue-600 font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/40"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-32 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Explore Events</h1>
            <p className="text-gray-400 text-sm max-w-md">Discover privacy-first events deployed on Zama/Sepolia</p>
          </div>

          <button
            onClick={() => router.push("/eventz/create")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-black font-bold text-sm transition-transform hover:scale-105 bg-[#CFFF04] hover:bg-[#bce600]"
          >
            <Plus size={16} /> Create Event
          </button>
        </div>
        <div className="relative mb-12">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search events by contract address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1F36] border border-white/5 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>
        {eventList.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-bold">Featured Events</h2>
              <span className="text-[#CFFF04] text-xs font-bold px-2 py-0.5 bg-[#CFFF04]/10 rounded border border-[#CFFF04]/20">
                NEW
              </span>
            </div>
            <FeaturedCarousel addresses={eventList} />
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Latest Deployments</h2>

          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-400 hidden md:block">{eventList.length} events found on-chain</div>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1F36] border border-white/10 hover:border-white/30 text-white text-xs transition-colors"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        {isListLoading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="w-10 h-10 text-[#CFFF04] animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventList.length > 0 ? (
              eventList.map(
                (address: string) =>
                  (!searchQuery || address.toLowerCase().includes(searchQuery.toLowerCase())) && (
                    <EventCard key={address} address={address} />
                  ),
              )
            ) : (
              <div className="col-span-full text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                <Search className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
                <p className="text-gray-400 mb-6">Be the first to deploy an event on Zama!</p>
                <button onClick={() => router.push("/eventz/create")} className="text-[#CFFF04] hover:underline">
                  Create your first event
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
