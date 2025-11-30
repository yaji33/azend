"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AlertCircle, Calendar, DollarSign, Loader2, MapPin, ShieldCheck, Users } from "lucide-react";
import { useReadContract } from "wagmi";
import { AZEND_EVENT_ABI } from "~~/contracts/config";

export const EventCard = ({ address }: { address: string }) => {
  const router = useRouter();
  const contractAddress = address as `0x${string}`;
  const [imageError, setImageError] = useState(false);

  const {
    data: eventName,
    isLoading: nameLoading,
    error: nameError,
  } = useReadContract({
    address: contractAddress,
    abi: AZEND_EVENT_ABI,
    functionName: "eventName",
  });

  const { data: description } = useReadContract({
    address: contractAddress,
    abi: AZEND_EVENT_ABI,
    functionName: "description",
  });

  const { data: startTime, isLoading: startLoading } = useReadContract({
    address: contractAddress,
    abi: AZEND_EVENT_ABI,
    functionName: "startTime",
  });

  const { data: capacity, isLoading: capacityLoading } = useReadContract({
    address: contractAddress,
    abi: AZEND_EVENT_ABI,
    functionName: "capacity",
  });

  const { data: bannerHash } = useReadContract({
    address: contractAddress,
    abi: AZEND_EVENT_ABI,
    functionName: "bannerIpfsHash",
  });

  const { data: location } = useReadContract({
    address: contractAddress,
    abi: AZEND_EVENT_ABI,
    functionName: "location",
  });

  const { data: isFreeEvent } = useReadContract({
    address: contractAddress,
    abi: AZEND_EVENT_ABI,
    functionName: "isFreeEvent",
  });

  const isLoading = nameLoading || startLoading || capacityLoading;

  if (isLoading) {
    return (
      <div className="bg-[#192144] h-[350px] rounded-xl animate-pulse border border-white/5 flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-blue-500" />
        <span className="text-xs text-gray-500">Fetching Contract Data...</span>
      </div>
    );
  }

  const displayName = eventName ? String(eventName) : "Untitled Event";
  const displayDescription = description ? String (description) : "Untitled Description";
  const startUnix = startTime ? Number(startTime) : 0;
  const dateString = startUnix > 0 ? format(new Date(startUnix * 1000), "MMM dd, yyyy") : "Date TBA";
  const displayCapacity = capacity ? Number(capacity) : 0;
  const displayLocation = location ? String(location) : "Location TBA";
  const isFree = isFreeEvent !== undefined ? Boolean(isFreeEvent) : true;

  const bannerUrl =
    bannerHash && String(bannerHash).length > 0 ? `https://gateway.pinata.cloud/ipfs/${bannerHash}` : null;

  const gradientIndex = parseInt(address.slice(-1), 16) % 4;
  const gradients = [
    "from-blue-600 to-purple-600",
    "from-emerald-500 to-teal-900",
    "from-orange-500 to-red-900",
    "from-pink-500 to-rose-900",
  ];

  return (
    <div
      onClick={() => router.push(`/eventz/${address}`)}
      className="bg-[#192144] rounded-xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all group cursor-pointer"
    >
      <div
        className={`relative h-48 overflow-hidden ${!bannerUrl || imageError ? `bg-gradient-to-br ${gradients[gradientIndex]}` : ""}`}
      >
        {bannerUrl && !imageError ? (
          <>
            <img
              src={bannerUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <span className="text-4xl font-bold text-white/20">EVENT</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold border border-white/10 flex items-center gap-1">
          {isFree ? (
            <>
              <span className="text-green-400">●</span> Free
            </>
          ) : (
            <>
              <DollarSign size={12} className="text-yellow-400" />
              <span>Paid</span>
            </>
          )}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold mb-1 truncate text-white">{displayName}</h3>

        {nameError && (
          <div className="text-red-400 text-xs flex items-center gap-1 mb-2">
            <AlertCircle size={12} /> Failed to read contract
          </div>
        )}

        <p className="text-gray-400 text-xs mb-4">{displayDescription}</p>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Calendar size={16} className="text-blue-400" />
            <span>{dateString}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <MapPin size={16} className="text-blue-400" />
            <span className="truncate">{displayLocation}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Users size={16} className="text-blue-400" />
            <span>Cap: {displayCapacity}</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 flex justify-between items-center">
          <span className="text-xs text-gray-500 font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <div className="flex items-center gap-1.5 text-blue-400">
            <ShieldCheck size={14} />
            <span className="text-xs font-medium">Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
