"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createFhevmInstance } from "@fhevm-sdk";
import { format } from "date-fns";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Lock,
  MapPin,
  Shield,
  Ticket,
  User,
  Wallet,
} from "lucide-react";
import { formatEther, toHex } from "viem";
import { useAccount, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
// --- IMPORTS ---
import LoginModal from "~~/components/LoginModal";
import Navbar from "~~/components/Navbar";
import { AZEND_EVENT_ABI } from "~~/contracts/config";

export default function DashboardEventDetails() {
  const router = useRouter();
  const params = useParams();
  const { address, isConnected, connector } = useAccount();

  const [isMounted, setIsMounted] = useState(false);
  const [isFheLoading, setIsFheLoading] = useState(false);
  const [fheStatus, setFheStatus] = useState<string>("");

  const contractAddress = params.id as `0x${string}`;

  // --- WRITE HOOKS ---
  const { writeContract, data: hash, isPending: isTxPending, error: txError } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- 1. FETCH EVENT & USER DATA ---
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "eventName" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "description" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "location" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "startTime" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "bannerIpfsHash" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "capacity" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "organizer" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "ticketPrice" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "isFreeEvent" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "requiresApproval" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "hasAttended", args: [address!] },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "isApproved", args: [address!] },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "requestData", args: [address!] },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "hasRequested", args: [address!] },
    ],
  });

  // --- 2. PARSE DATA ---
  const eventName = data?.[0]?.result ? String(data[0].result) : "Loading...";
  const description = data?.[1]?.result ? String(data[1].result) : "";
  const location = data?.[2]?.result ? String(data[2].result) : "TBA";
  const startUnix = data?.[3]?.result ? Number(data[3].result) : 0;
  const bannerHash = data?.[4]?.result ? String(data[4].result) : "";
  const capacity = data?.[5]?.result ? Number(data[5].result) : 0;
  const organizerAddress = data?.[6]?.result ? String(data[6].result) : "";

  const ticketPrice = data?.[7]?.result ? BigInt(data[7].result as bigint) : BigInt(0);
  const isFreeEvent = data?.[8]?.result ? Boolean(data[8].result) : false;
  const requiresApproval = data?.[9]?.result ? Boolean(data[9].result) : false;

  const hasAttended = data?.[10]?.result ? Boolean(data[10].result) : false;
  const isApproved = data?.[11]?.result ? Boolean(data[11].result) : false;
  const requestData = data?.[12]?.result ? String(data[12].result) : "";
  const hasRequested = data?.[13]?.result ? Boolean(data[13].result) : false;

  // Derived State
  const isOrganizer = address === organizerAddress;
  const formattedDate = startUnix > 0 ? format(new Date(startUnix * 1000), "EEEE, MMM do yyyy • h:mm a") : "TBA";
  const bannerUrl = bannerHash
    ? `https://gateway.pinata.cloud/ipfs/${bannerHash}`
    : "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200";

  const isPendingApproval = requiresApproval && !isApproved && hasRequested;

  // --- 3. ACTIONS ---

  const handleRequestJoin = () => {
    writeContract({
      address: contractAddress,
      abi: AZEND_EVENT_ABI,
      functionName: "requestToJoin",
      args: ["Requesting access via Web Dashboard"],
    });
  };

  const handlePurchaseAndCheckIn = async () => {
    if (!address || !connector) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsFheLoading(true);
      setFheStatus("Initializing secure environment...");

      // 1. Get Provider
      const provider = await connector.getProvider();
      const controller = new AbortController();

      // 2. Create Instance using @fhevm-sdk
      const instance = await createFhevmInstance({
        provider: provider as any,
        signal: controller.signal,
        onStatusChange: status => setFheStatus(`FHE Status: ${status}`),
      });

      // 3. Pack timestamp and ticket type into a single euint64
      setFheStatus("Encrypting check-in data...");
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const ticketType = 1; // Standard ticket

      // Pack: (timestamp << 8) | ticketType
      const packedValue = (currentTimestamp << 8) | ticketType;

      const packedInput = instance.createEncryptedInput(contractAddress, address);
      packedInput.add64(packedValue);
      const encryptedPacked = await packedInput.encrypt();

      setFheStatus("Sending transaction...");

      // 4. Send Transaction with correct signature: checkIn(externalEuint64, bytes)
      writeContract({
        address: contractAddress,
        abi: AZEND_EVENT_ABI,
        functionName: "checkIn",
        args: [
          toHex(encryptedPacked.handles[0]), // inputPacked
          toHex(encryptedPacked.inputProof), // packedProof
        ],
        value: isFreeEvent ? BigInt(0) : ticketPrice,
      });
    } catch (e: any) {
      console.error("FHE Flow Error:", e);
      // Handle user rejection specifically to avoid scary alerts
      if (e?.code === 4001 || e?.cause?.code === 4001 || e?.message?.includes("User rejected")) {
        setFheStatus("");
      } else {
        alert("Failed to encrypt data. Please check console.");
      }
    } finally {
      setIsFheLoading(false);
    }
  };

  // Refresh data on success
  useEffect(() => {
    if (isTxSuccess) {
      refetch();
      setFheStatus("");
    }
  }, [isTxSuccess, refetch]);

  // --- RENDER ---
  if (!isMounted) return null;
  if (!isConnected) return <LoginModal isOpen={true} onClose={() => router.push("/")} />;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#021337] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#CFFF04] animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#021337] text-white font-sans pb-20">
      <Navbar />
      <div className="max-w-[1100px] mx-auto px-6 md:px-12 pt-32">
        {/* Navigation */}
        <button
          onClick={() => router.push("/dashboard")}
          className="group flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111633]/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative h-72 w-full">
                <img src={bannerUrl} alt={eventName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111633] to-transparent opacity-90" />
                <div className="absolute bottom-6 left-8 right-8">
                  <h1 className="text-4xl font-black text-white mb-2">{eventName}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} className="text-[#CFFF04]" /> {formattedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-[#CFFF04]" /> {location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-4">
                <div className="flex gap-4 mb-6">
                  <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-sm">
                    <span className="text-gray-400 text-xs uppercase block">Price</span>
                    <span className="font-bold text-[#CFFF04]">
                      {isFreeEvent ? "FREE" : `${formatEther(ticketPrice)} ETH`}
                    </span>
                  </div>
                  <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-sm">
                    <span className="text-gray-400 text-xs uppercase block">Capacity</span>
                    <span className="font-bold text-white">{capacity} Seats</span>
                  </div>
                  <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-sm">
                    <span className="text-gray-400 text-xs uppercase block">Privacy</span>
                    <span className="font-bold text-purple-400 flex items-center gap-1">
                      <Shield size={12} /> FHE Encrypted
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">About Event</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Action Card */}
          <div className="space-y-6">
            {/* 1. ATTENDEE STATUS CARD */}
            {!isOrganizer && (
              <div className="bg-[#192144] border border-[#CFFF04]/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#CFFF04]/10 rounded-full blur-3xl pointer-events-none"></div>

                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Ticket className="text-[#CFFF04]" /> Ticket Status
                </h3>

                {/* STATE: ALREADY JOINED */}
                {hasAttended ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-1">You&apos;re In!</h4>
                    <p className="text-sm text-gray-400 mb-6">
                      Your attendance has been cryptographically verified on-chain.
                    </p>

                    <div className="bg-white p-2 rounded-xl w-40 h-40 mx-auto shadow-lg">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({ address: contractAddress, user: address }))}&color=000000&bgcolor=ffffff`}
                        className="w-full h-full object-contain"
                        alt="Ticket QR"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Show this at the venue</p>
                  </div>
                ) : (
                  /* STATE: NOT JOINED YET */
                  <div className="space-y-4">
                    {requiresApproval && !isApproved ? (
                      /* SUB-STATE: NEEDS APPROVAL */
                      isPendingApproval ? (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                          <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                          <h4 className="font-bold text-yellow-500">Approval Pending</h4>
                          <p className="text-xs text-gray-400 mt-1">The host is reviewing your request.</p>
                        </div>
                      ) : (
                        <div>
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                            <h4 className="font-bold text-blue-400 text-sm flex items-center gap-2">
                              <Lock size={14} /> Private Event
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              You must request access from the host before purchasing a ticket.
                            </p>
                          </div>
                          <button
                            onClick={handleRequestJoin}
                            disabled={isTxPending || isTxConfirming}
                            className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-200 transition-all flex justify-center items-center gap-2"
                          >
                            {isTxPending ? <Loader2 className="animate-spin" /> : "Request to Join"}
                          </button>
                        </div>
                      )
                    ) : (
                      /* SUB-STATE: READY TO BUY/JOIN (Open or Approved) */
                      <div>
                        <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                          <span className="text-gray-400 text-sm">Total</span>
                          <span className="text-2xl font-bold text-white">
                            {isFreeEvent ? "Free" : `${formatEther(ticketPrice)} ETH`}
                          </span>
                        </div>

                        <button
                          onClick={handlePurchaseAndCheckIn}
                          disabled={isTxPending || isTxConfirming || isFheLoading}
                          className="w-full bg-[#CFFF04] hover:bg-[#bce600] disabled:opacity-50 disabled:cursor-not-allowed text-black py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-[#CFFF04]/10 flex items-center justify-center gap-2"
                        >
                          {isTxPending || isTxConfirming || isFheLoading ? (
                            <>
                              <Loader2 className="animate-spin" />
                              <span className="text-sm ml-2">
                                {isFheLoading ? fheStatus || "Encrypting..." : "Processing..."}
                              </span>
                            </>
                          ) : (
                            <>
                              <Wallet size={20} />
                              {isFreeEvent ? "Claim Ticket" : "Pay & Join"}
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-center text-gray-500 mt-3">
                          Clicking this will generate a Zero-Knowledge proof of your timestamp and ticket type.
                        </p>
                      </div>
                    )}

                    {txError && (
                      <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-200 mt-2 break-all">
                        Error: {txError.message.slice(0, 100)}...
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. ORGANIZER TOOLS (If Organizer) */}
            {isOrganizer && (
              <div className="bg-[#111633]/40 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Owner Mode</p>
                    <p className="text-sm font-bold text-white">Manage Event</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/${contractAddress}/analytics`)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 group"
                >
                  <BarChart3 size={16} className="text-blue-400" />
                  View Live Analytics
                </button>
              </div>
            )}

            {/* 3. QR Download (Only if attended or organizer) */}
            {(hasAttended || isOrganizer) && (
              <div className="bg-[#111633]/40 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-white p-1 rounded w-12 h-12 shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(contractAddress)}`}
                    alt="QR"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Event QR</p>
                  <button
                    onClick={() =>
                      window.open(
                        `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(contractAddress)}`,
                        "_blank",
                      )
                    }
                    className="text-xs text-[#CFFF04] hover:underline flex items-center gap-1"
                  >
                    Download <ExternalLink size={10} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
