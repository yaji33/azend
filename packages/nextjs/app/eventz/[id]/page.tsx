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
  Lock,
  MapPin,
  Share2,
  Ticket,
  User,
  UserCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { formatEther, toHex } from "viem";
import { useAccount, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import JoinRequestModal from "~~/components/JoinRequestModal";
import LoginModal from "~~/components/LoginModal";
import Navbar from "~~/components/Navbar";
import { AZEND_EVENT_ABI } from "~~/contracts/config";

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { address: userAddress, isConnected, connector } = useAccount();

  const [isMounted, setIsMounted] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isFheLoading, setIsFheLoading] = useState(false);
  const [fheStatus, setFheStatus] = useState("");
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
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "hasAttended", args: [userAddress!] },
    ],
  });

  const {
    writeContract,
    data: txHash,
    isPending,
    error: txError,
  } = useWriteContract({
    mutation: {
      onError: error => {
        console.error("❌ [CHECK-IN] Write contract error:", error);
        console.error("❌ [CHECK-IN] Error details:", {
          name: error.name,
          message: error.message,
          cause: error.cause,
        });
        toast.error(`Transaction failed: ${error.message.slice(0, 50)}...`);
        setIsFheLoading(false);
        setFheStatus("");
      },
      onSuccess: data => {
        console.log("✅ [CHECK-IN] Transaction sent:", data);
      },
    },
  });
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // Monitor state changes
  useEffect(() => {
    console.log("📊 [CHECK-IN STATE]", {
      isPending,
      isConfirming,
      isConfirmed,
      txHash,
      isFheLoading,
      fheStatus,
    });
  }, [isPending, isConfirming, isConfirmed, txHash, isFheLoading, fheStatus]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Transaction successful!");
      setIsRequestModalOpen(false);
      setFheStatus("");
      setIsFheLoading(false);
      refetch();
    }
  }, [isConfirmed, refetch]);

  useEffect(() => {
    if (txError) {
      toast.error(`Transaction failed: ${txError.message.slice(0, 50)}...`);
      setIsFheLoading(false);
      setFheStatus("");
    }
  }, [txError]);

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
  const price = data?.[9]?.result ? BigInt(data[9].result as bigint) : BigInt(0);
  const isApproved = data?.[10]?.result ? Boolean(data[10].result) : false;
  const hasRequested = data?.[11]?.result ? String(data[11].result).length > 0 : false;
  const hasAttended = data?.[12]?.result ? Boolean(data[12].result) : false;
  const isOrganizer = userAddress === organizer;

  const handleRequestSubmit = (note: string) => {
    writeContract({
      address: contractAddress,
      abi: AZEND_EVENT_ABI,
      functionName: "requestToJoin",
      args: [note],
    });
  };

  const handlePurchaseAndCheckIn = async () => {
    console.log("🔍 Pre-flight checks:", {
      requiresApproval,
      isApproved,
      hasAttended,
      isOrganizer,
      contractAddress,
      userAddress,
      isFree,
      price: price.toString(),
    });

    if (!connector || !userAddress) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      setIsFheLoading(true);
      setFheStatus("Initializing secure environment...");

      const { createInstance, initSDK, SepoliaConfig } = await import("@zama-fhe/relayer-sdk/web");
      await initSDK();

      const instance = await createInstance({
        ...SepoliaConfig,
        chainId: 11155111,
        network: "https://ethereum-sepolia-rpc.publicnode.com",
      });

      setFheStatus("Loading encryption keys...");
      await instance.generateKeypair();

      setFheStatus("Encrypting check-in data...");

      // Pack timestamp and ticket type into single value
      const timestamp = BigInt(Math.floor(Date.now() / 1000));
      const ticketType = BigInt(1);
      const packed = (timestamp << BigInt(8)) | ticketType;

      // Encrypt as single euint64
      const packedInput = instance.createEncryptedInput(contractAddress, userAddress);
      packedInput.add64(packed);
      const encryptedPacked = await packedInput.encrypt();

      setFheStatus("Confirming transaction...");

      writeContract({
        address: contractAddress,
        abi: AZEND_EVENT_ABI,
        functionName: "checkIn",
        args: [
          toHex(encryptedPacked.handles[0]), // inputPacked
          toHex(encryptedPacked.inputProof), // packedProof
        ],
        value: isFree ? BigInt(0) : price,
        gas: 5000000n, // Increased to 5M gas for FHE operations
      });
    } catch (e: any) {
      console.error("FHE Error:", e);
      if (e?.code === 4001 || e?.cause?.code === 4001 || e?.message?.includes("User rejected")) {
        toast.info("Transaction cancelled");
      } else {
        toast.error(`Error: ${e.message.slice(0, 100)}...`);
      }
      setIsFheLoading(false);
      setFheStatus("");
    }
  };

  if (!isMounted) return null;
  if (!isConnected) return <LoginModal isOpen={true} onClose={() => router.push("/")} />;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#020410] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#CFFF04] animate-spin" />
      </main>
    );
  }

  const renderActionSection = () => {
    if (isOrganizer) {
      return (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-200 text-sm mb-4">
          You are the host. Go to your <b>Organizer Dashboard</b> to manage requests.
        </div>
      );
    }

    if (hasAttended) {
      return (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300 text-sm mb-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle size={18} /> Ticket Confirmed
          </div>
          <p className="text-xs text-green-400/70">
            You have successfully paid and generated your zero-knowledge check-in proof.
          </p>
        </div>
      );
    }

    if (hasRequested && !isApproved) {
      return (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm mb-4 flex items-center gap-2">
          <Clock size={18} /> Your request is pending approval by the host.
        </div>
      );
    }

    const canJoin = !requiresApproval || isApproved;

    if (canJoin) {
      return (
        <div className="space-y-4">
          {!isFree && (
            <div className="flex justify-between items-center text-sm px-1">
              <span className="text-gray-400">Total Price</span>
              <span className="text-xl font-bold text-white">{formatEther(price)} ETH</span>
            </div>
          )}

          <button
            onClick={handlePurchaseAndCheckIn}
            disabled={isPending || isConfirming || isFheLoading}
            className="w-full bg-[#CFFF04] hover:bg-[#bce600] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isPending || isConfirming || isFheLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm">{fheStatus || "Processing..."}</span>
              </>
            ) : (
              <>
                <Wallet size={20} />
                {isFree ? "Claim Ticket" : "Pay & Join"}
              </>
            )}
          </button>
          <p className="text-[10px] text-center text-gray-500">Secure FHE Transaction • Encrypted Check-In</p>
        </div>
      );
    }

    return (
      <>
        <p className="text-sm text-gray-400 mb-6">
          This is a curated private event. Please introduce yourself to the host to gain access.
        </p>
        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="w-full bg-[#E0E0E0] hover:bg-white text-black font-bold py-3 rounded-md transition-colors shadow-lg flex justify-center gap-2 items-center"
        >
          <Lock size={16} /> Request to Join
        </button>
      </>
    );
  };

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
                <DollarSign size={14} strokeWidth={3} /> {formatEther(price)} ETH
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
                <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                  <Ticket size={16} className="text-[#CFFF04]" /> Registration
                </h3>
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
                {renderActionSection()}
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
                    className={`bg-white p-3 rounded-xl mb-4 transition-all duration-500 ${!hasAttended ? "opacity-10 blur-md grayscale" : ""}`}
                  >
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({ address: contractAddress, user: userAddress }))}`}
                      alt="QR Code"
                      className="w-40 h-40"
                    />
                  </div>
                  {!hasAttended ? (
                    <p className="text-[10px] text-yellow-400 flex items-center gap-1">
                      <Lock size={10} /> Buy ticket to reveal QR
                    </p>
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
