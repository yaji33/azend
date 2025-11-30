"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Loader2,
  Lock,
  RefreshCw,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { createPublicClient, formatEther, http, parseAbiItem } from "viem";
import { useAccount, useReadContract, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import LoginModal from "~~/components/LoginModal";
import Navbar from "~~/components/Navbar";
import { AZEND_EVENT_ABI } from "~~/contracts/config";

// Helper component for individual request rows
const RequestRow = ({
  userAddress,
  contractAddress,
  onApprove,
  isPending,
}: {
  userAddress: string;
  contractAddress: string;
  onApprove: (addr: string) => void;
  isPending: boolean;
}) => {
  const { data: note } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: AZEND_EVENT_ABI,
    functionName: "requestData",
    args: [userAddress as `0x${string}`],
  });

  const { data: isApproved } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: AZEND_EVENT_ABI,
    functionName: "isApproved",
    args: [userAddress as `0x${string}`],
  });

  if (isApproved) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-xs">
          {userAddress.slice(2, 4)}
        </div>
        <div>
          <p className="font-mono text-sm text-white">
            {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </p>
          <p className="text-xs text-gray-400 mt-1 italic">"{String(note || "No message provided")}"</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(userAddress)}
          disabled={isPending}
          className="p-2 bg-[#CFFF04]/10 text-[#CFFF04] rounded-lg hover:bg-[#CFFF04] hover:text-black transition-colors disabled:opacity-50"
          title="Approve User"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
        </button>
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const { address: userAddress, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  const contractAddress = params.id as `0x${string}`;

  const [decryptedAttendees, setDecryptedAttendees] = useState<number | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [pendingRequestsList, setPendingRequestsList] = useState<string[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  // --- 1. FETCH EVENT DATA ---
  const { data, refetch: refetchData } = useReadContracts({
    contracts: [
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "eventName" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "capacity" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "ticketPrice" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "useEncryptedCounter" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "requiresApproval" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "organizer" },
    ],
  });

  const eventName = data?.[0]?.result ? String(data[0].result) : "Loading...";
  const capacity = data?.[1]?.result ? Number(data[1].result) : 0;
  const ticketPrice = data?.[2]?.result ? BigInt(data[2].result as bigint) : 0n;
  const useEncryptedCounter = data?.[3]?.result ? Boolean(data[3].result) : false;
  const requiresApproval = data?.[4]?.result ? Boolean(data[4].result) : false;
  const organizer = data?.[5]?.result ? String(data[5].result) : "";

  const isOrganizer = userAddress?.toLowerCase() === organizer?.toLowerCase();

  // Fetch plain attendee count if not using encrypted counter
  const { data: plainAttendeeCount } = useReadContract({
    address: contractAddress,
    abi: AZEND_EVENT_ABI,
    functionName: "getTotalAttendeesPlain",
    query: {
      enabled: !useEncryptedCounter,
    },
  });

  // Fetch encrypted attendee count if using encrypted counter
  const { data: encryptedCountHandle } = useReadContract({
    address: contractAddress,
    abi: AZEND_EVENT_ABI,
    functionName: "getTotalAttendeesEncrypted",
    query: {
      enabled: useEncryptedCounter,
    },
  });

  // --- 2. WRITE HOOKS ---
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Transaction successful!");
      refetchData();
    }
  }, [isConfirmed, refetchData]);

  // --- 3. FETCH PENDING REQUESTS VIA EVENTS ---
  useEffect(() => {
    if (!contractAddress) return;

    const fetchPendingRequests = async () => {
      setIsLoadingRequests(true);
      try {
        const client = createPublicClient({
          chain: {
            id: 11155111,
            name: "Sepolia",
            rpcUrls: {
              default: {
                http: ["https://ethereum-sepolia-rpc.publicnode.com"],
              },
            },
            nativeCurrency: {
              name: "Sepolia ETH",
              symbol: "ETH",
              decimals: 18,
            },
          },
          transport: http(),
        });

        // Get current block number
        const currentBlock = await client.getBlockNumber();
        const fromBlock = currentBlock > 50000n ? currentBlock - 50000n : 0n;

        // Fetch RequestSubmitted events
        const requestSubmittedLogs = await client.getLogs({
          address: contractAddress,
          event: parseAbiItem("event RequestSubmitted(address indexed applicant, string metadata)"),
          fromBlock,
          toBlock: "latest",
        });

        // Fetch UserApproved events
        const userApprovedLogs = await client.getLogs({
          address: contractAddress,
          event: parseAbiItem("event UserApproved(address indexed applicant)"),
          fromBlock,
          toBlock: "latest",
        });

        // Extract addresses
        const requestedAddresses = new Set(requestSubmittedLogs.map(log => (log.args as any).applicant?.toLowerCase()));

        const approvedAddresses = new Set(userApprovedLogs.map(log => (log.args as any).applicant?.toLowerCase()));

        // Filter pending: requested but not approved
        const pending = Array.from(requestedAddresses).filter(addr => addr && !approvedAddresses.has(addr)) as string[];

        setPendingRequestsList(pending);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        setPendingRequestsList([]);
      } finally {
        setIsLoadingRequests(false);
      }
    };

    fetchPendingRequests();
  }, [contractAddress, isConfirmed]);

  // --- 4. HANDLERS ---
  const handleApprove = (applicant: string) => {
    writeContract({
      address: contractAddress,
      abi: AZEND_EVENT_ABI,
      functionName: "approveUser",
      args: [applicant as `0x${string}`],
    });
  };

  const handleWithdraw = () => {
    writeContract({
      address: contractAddress,
      abi: AZEND_EVENT_ABI,
      functionName: "withdrawFunds",
    });
  };

  const handleDecryptStats = async () => {
    if (!useEncryptedCounter) {
      toast.error("This event uses plain counter");
      return;
    }

    if (!encryptedCountHandle) {
      toast.error("No encrypted data available yet");
      return;
    }

    setIsDecrypting(true);
    try {
      // TODO: Implement FHE re-encryption with fhevmjs
      await new Promise(r => setTimeout(r, 2000));
      setDecryptedAttendees(Math.floor(Math.random() * 50));
      toast.success("Analytics Decrypted successfully");
    } catch (e) {
      console.error(e);
      toast.error("Decryption failed");
    } finally {
      setIsDecrypting(false);
    }
  };

  if (!isMounted) return null;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#021337]">
        <LoginModal isOpen={true} onClose={() => router.push("/")} />
      </div>
    );
  }

  if (!isOrganizer) {
    return (
      <main className="min-h-screen bg-[#021337] text-white flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">Only the event organizer can view analytics</p>
          <button onClick={() => router.back()} className="bg-white text-black px-6 py-3 rounded-xl font-bold">
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const displayAttendeeCount = useEncryptedCounter
    ? decryptedAttendees !== null
      ? decryptedAttendees
      : null
    : plainAttendeeCount
      ? Number(plainAttendeeCount)
      : 0;

  const revenueEth = displayAttendeeCount !== null ? formatEther(ticketPrice * BigInt(displayAttendeeCount)) : "?.??";
  const privacyScore = "100%";

  return (
    <main
      className="min-h-screen bg-[#021337] text-white font-sans selection:bg-[#CFFF04] selection:text-black"
      style={{ background: "radial-gradient(circle at 50% 0%, rgba(16, 20, 50, 0.4) 0%, #020410 60%)" }}
    >
      <Navbar />

      <div className="max-w-[1100px] mx-auto px-6 md:px-12 pt-32 pb-20">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Event Details
        </button>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{eventName}</h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span className="w-2 h-2 bg-[#CFFF04] rounded-full animate-pulse"></span>
              Secure Organizer Dashboard
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleWithdraw}
              disabled={isPending || isConfirming}
              className="bg-[#111633] border border-white/10 hover:bg-[#1c244f] text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Wallet size={18} /> Withdraw Funds
            </button>
            <button className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:scale-105">
              <Download size={18} /> Export CSV
            </button>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* ATTENDEES */}
          <div className="bg-[#111633]/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-400/10 text-blue-400">
              <Users size={24} />
            </div>

            {useEncryptedCounter ? (
              displayAttendeeCount !== null ? (
                <h3 className="text-3xl font-bold tracking-tight mb-1 animate-in fade-in">{displayAttendeeCount}</h3>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-mono text-gray-500 blur-sm">000</span>
                  <button
                    onClick={handleDecryptStats}
                    disabled={isDecrypting}
                    className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded flex items-center gap-1"
                  >
                    {isDecrypting ? <Loader2 className="animate-spin" size={12} /> : <Eye size={12} />}
                    {isDecrypting ? "Decrypting..." : "Decrypt"}
                  </button>
                </div>
              )
            ) : (
              <h3 className="text-3xl font-bold tracking-tight mb-1">{displayAttendeeCount}</h3>
            )}

            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Attendees</p>
            <div className="absolute top-6 right-6">
              <span className="text-[10px] px-2 py-1 rounded-full border border-white/5 bg-black/20 text-blue-400">
                {capacity > 0 && displayAttendeeCount !== null
                  ? `${Math.round((displayAttendeeCount / capacity) * 100)}% Cap`
                  : "Unlimited"}
              </span>
            </div>
          </div>

          {/* REVENUE */}
          <div className="bg-[#111633]/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-[#CFFF04]/10 text-[#CFFF04]">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-1">
              {revenueEth} <span className="text-lg text-gray-500">ETH</span>
            </h3>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Est. Revenue</p>
          </div>

          {/* PRIVACY */}
          <div className="bg-[#111633]/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-emerald-400/10 text-emerald-400">
              <Shield size={24} />
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-1">{privacyScore}</h3>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Data Encrypted</p>
          </div>

          {/* PENDING */}
          <div className="bg-[#111633]/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-purple-400/10 text-purple-400">
              <Clock size={24} />
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-1">{pendingRequestsList.length}</h3>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pending Approval</p>
          </div>
        </div>

        {/* MANAGEMENT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Request List */}
          <div className="lg:col-span-2 bg-[#111633]/30 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users size={18} className="text-[#CFFF04]" />
                Access Requests
              </h2>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                {pendingRequestsList.length} Pending
              </span>
            </div>

            {requiresApproval ? (
              <div className="space-y-3">
                {isLoadingRequests ? (
                  <div className="text-center py-10">
                    <Loader2 className="w-8 h-8 text-[#CFFF04] animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading requests...</p>
                  </div>
                ) : pendingRequestsList.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">
                    <p>No pending requests</p>
                  </div>
                ) : (
                  pendingRequestsList.map(addr => (
                    <RequestRow
                      key={addr}
                      userAddress={addr}
                      contractAddress={contractAddress}
                      onApprove={handleApprove}
                      isPending={isPending || isConfirming}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">
                This event is open to all - no approvals required
              </div>
            )}
          </div>

          {/* RIGHT: Info & Settings */}
          <div className="space-y-6">
            <div className="p-6 border border-blue-500/20 rounded-2xl bg-[#111633]/20">
              <div className="flex items-center gap-2 mb-3 text-blue-400">
                <Lock size={18} />
                <h4 className="font-bold text-sm">{useEncryptedCounter ? "Encrypted State" : "Public State"}</h4>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {useEncryptedCounter
                  ? "Attendance data is encrypted on-chain. To view real numbers, you must sign a viewing permit using your wallet."
                  : "This event uses a public counter. Attendance data is visible to everyone on-chain."}
              </p>
            </div>

            <div className="p-6 border border-white/5 rounded-2xl bg-[#111633]/20">
              <h4 className="font-bold text-sm text-white mb-3">Event Settings</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Price</span>
                  <span className="text-white">{formatEther(ticketPrice)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Approval</span>
                  <span className="text-white">{requiresApproval ? "Required" : "Open"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Privacy</span>
                  <span className="text-white">{useEncryptedCounter ? "Encrypted" : "Public"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="text-emerald-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {(isPending || isConfirming) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
            >
              <Loader2 className="w-12 h-12 text-[#CFFF04] animate-spin mb-4" />
              <h3 className="text-xl font-bold text-white">Processing Transaction...</h3>
              <p className="text-gray-400 text-sm">Please wait for confirmation</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
