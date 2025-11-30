"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { useReadContracts } from "wagmi";
import { AZEND_EVENT_ABI } from "~~/contracts/config";

export const DashboardEventCard = ({ address, variants }: { address: string; variants: any }) => {
  const router = useRouter();
  const contractAddress = address as `0x${string}`;

  // Fetch Event Details
  const { data, isLoading } = useReadContracts({
    contracts: [
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "eventName" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "startTime" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "location" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "bannerIpfsHash" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "isFreeEvent" }, 
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "requiresApproval" },
    ],
  });

  if (isLoading) {
    return <div className="h-32 w-full bg-[#111633]/30 rounded-xl animate-pulse border border-white/5 mb-4" />;
  }

  // Parse Data
  const eventName = data?.[0]?.result ? String(data[0].result) : "Untitled Event";
  const startUnix = data?.[1]?.result ? Number(data[1].result) : 0;
  const location = data?.[2]?.result ? String(data[2].result) : "TBA";
  const bannerHash = data?.[3]?.result ? String(data[3].result) : "";

  // Format Helpers
  const dateString = startUnix > 0 ? format(new Date(startUnix * 1000), "MMM dd, yyyy") : "Date TBA";
  const bannerUrl = bannerHash ? `https://gateway.pinata.cloud/ipfs/${bannerHash}` : null;

  // Gradient Fallback
  const gradientIndex = parseInt(address.slice(-1), 16) % 4;
  const gradients = [
    "from-blue-600 to-purple-600",
    "from-emerald-500 to-teal-900",
    "from-orange-500 to-red-900",
    "from-pink-500 to-rose-900",
  ];

  return (
    <motion.div
      variants={variants}
      onClick={() => router.push(`/dashboard/${address}`)} // Link to Dashboard Detail View
      className="group relative flex flex-col md:flex-row bg-[#111633]/30 border border-white/5 hover:border-[#CFFF04]/30 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:shadow-[#CFFF04]/5 hover:bg-[#111633]/50"
    >
      {/* Image Section */}
      <div
        className={`w-full md:w-48 h-32 md:h-auto relative shrink-0 overflow-hidden ${!bannerUrl ? `bg-gradient-to-br ${gradients[gradientIndex]}` : ""}`}
      >
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={eventName}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-30 font-bold text-white">EVENT</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020410]/80 to-transparent" />
      </div>

      {/* Details Section */}
      <div className="flex-1 p-5 flex flex-col justify-center gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-[#CFFF04] transition-colors line-clamp-1">
              {eventName}
            </h3>
            <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {dateString}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {location}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 bg-[#CFFF04]/10 border border-[#CFFF04]/20 px-3 py-1.5 rounded-lg shrink-0">
            <CheckCircle2 size={14} className="text-[#CFFF04]" />
            <span className="text-[10px] font-bold text-[#CFFF04] uppercase tracking-wider">Live</span>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="hidden md:flex w-16 items-center justify-center border-l border-white/5 text-gray-600 group-hover:bg-[#CFFF04] group-hover:text-black transition-all duration-300">
        <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
};
