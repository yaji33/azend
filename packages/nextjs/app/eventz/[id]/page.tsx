"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  Share2,
  User,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { formatEther } from "viem";
import { useAccount, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import JoinRequestModal from "~~/components/JoinRequestModal";
import LoginModal from "~~/components/LoginModal";
import Navbar from "~~/components/Navbar";
import { AZEND_EVENT_ABI } from "~~/contracts/config";

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { address: userAddress, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const contractAddress = params.id as `0x${string}`;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "eventName" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "description" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "location" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "startTime" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "endTime" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "bannerIpfsHash" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "organizer" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "requiresApproval" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "isFreeEvent" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "ticketPrice" },
    
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "isApproved", args: [userAddress!] },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "requestData", args: [userAddress!] },
    ],
  });
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Request sent to host!");
      setIsRequestModalOpen(false);
      refetch();
    }
  }, [isConfirmed, refetch]);

  const eventName = data?.[0]?.result ? String(data[0].result) : "Untitled Event";
  const description = data?.[1]?.result ? String(data[1].result) : "No description provided.";
  const location = data?.[2]?.result ? String(data[2].result) : "TBA";

  const startUnix = data?.[3]?.result ? Number(data[3].result) : 0;
  const dateString = startUnix > 0 ? format(new Date(startUnix * 1000), "EEEE, MMMM do yyyy") : "Date TBA";
  const timeString = startUnix > 0 ? format(new Date(startUnix * 1000), "h:mm a") : "Time TBA";

  const bannerHash = data?.[5]?.result ? String(data[5].result) : "";
  const bannerUrl = bannerHash
    ? `https://gateway.pinata.cloud/ipfs/${bannerHash}`
    : "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200";

  const organizer = data?.[6]?.result ? String(data[6].result) : "Unknown Host";
  const requiresApproval = data?.[7]?.result ? Boolean(data[7].result) : false;
  const isFree = data?.[8]?.result !== undefined ? Boolean(data[8].result) : true;
  const price = data?.[9]?.result ? formatEther(data[9].result as bigint) : "0";
  const isApproved = data?.[10]?.result ? Boolean(data[10].result) : false;
  const hasRequested = data?.[11]?.result ? String(data[11].result).length > 0 : false;
  const isOrganizer = userAddress === organizer;

  const handleRequestSubmit = (note: string) => {
   
    writeContract({
      address: contractAddress,
      abi: AZEND_EVENT_ABI,
      functionName: "requestToJoin",
      args: [note],
    });
  };

  if (!isMounted) return null;
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#020410]">
        <LoginModal isOpen={true} onClose={() => router.push("/")} />
      </div>
    );
  }
  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#020410] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#CFFF04] animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020410] text-white font-sans selection:bg-[#CFFF04] selection:text-black">
      <Navbar />

      <JoinRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleRequestSubmit}
        isPending={isPending || isConfirming}
      />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-28 pb-20">
        <button
          onClick={() => router.push("/eventz")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Events
        </button>


        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-10 group border border-white/10">
          <img
            src={bannerUrl}
            alt={eventName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020410] via-transparent to-transparent opacity-90"></div>
          <div className="absolute top-4 right-4 flex gap-2">
            {!isFree && (
              <div className="bg-[#CFFF04] text-black px-4 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                <DollarSign size={14} strokeWidth={3} /> {price} ETH
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 tracking-tighter drop-shadow-2xl">
              {eventName.toUpperCase()}
            </h1>
            <p className="text-blue-300 font-bold tracking-[0.3em] text-xs md:text-sm mt-2 uppercase">
              PRIVATE EVENT • FHEVM
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h1 className="text-3xl font-bold mb-4">{eventName}</h1>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-3">
                  <User className="text-blue-500" size={18} />
                  <span>
                    Hosted by{" "}
                    <span className="text-white font-medium font-mono">
                      {organizer.slice(0, 6)}...{organizer.slice(-4)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-blue-500" size={18} />
                  <span>
                    {dateString} • {timeString}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-blue-500" size={18} />
                  <span>{location}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#192144] rounded-xl overflow-hidden border border-white/10 shadow-lg">
              <div className="bg-[#232d5b] p-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-gray-200">Registration</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4 text-sm">
                  {requiresApproval ? (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <UserCheck size={16} />
                      <span>Approval Required</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle size={16} />
                      <span>Open to All</span>
                    </div>
                  )}
                </div>
                {isOrganizer ? (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-200 text-sm mb-4">
                    You are the host. Go to your <b>Organizer Dashboard</b> to manage requests.
                  </div>
                ) : isApproved ? (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300 text-sm mb-4 flex items-center gap-2">
                    <CheckCircle size={18} /> You are approved for this event!
                  </div>
                ) : hasRequested ? (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm mb-4 flex items-center gap-2">
                    <Clock size={18} /> Your request is pending approval by the host.
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-400 mb-6">
                      {requiresApproval
                        ? "This is a curated event. Please introduce yourself to the host."
                        : "Join us! Simply register below."}
                    </p>
                    <button
                      onClick={() =>
                        requiresApproval ? setIsRequestModalOpen(true) : alert("Open registration logic here")
                      }
                      className="w-full bg-[#E0E0E0] hover:bg-white text-black font-bold py-3 rounded-md transition-colors shadow-lg"
                    >
                      {requiresApproval ? "Request to Join" : "Register Now"}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">About Event</h3>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{description}</p>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="bg-[#192144] rounded-xl p-1 border border-white/10 shadow-2xl">
                <div className="bg-[#111633] rounded-lg p-6 flex flex-col items-center text-center">
                  <h3 className="text-sm font-medium text-gray-300 mb-4 w-full text-left">Check in</h3>
                  <div
                    className={`bg-white p-3 rounded-xl mb-4 ${!isApproved && requiresApproval && !isOrganizer ? "opacity-20 blur-sm" : ""}`}
                  >
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({ address: contractAddress, name: eventName }))}`}
                      alt="QR Code"
                      className="w-40 h-40"
                    />
                  </div>
                  {!isApproved && requiresApproval && !isOrganizer ? (
                    <p className="text-[10px] text-yellow-400">🔒 Approval required to use check-in</p>
                  ) : (
                    <p className="text-[10px] text-gray-400">Scan at venue to check in privately</p>
                  )}
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white py-3 rounded-xl transition-colors text-sm">
                <Share2 size={16} /> Share Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
