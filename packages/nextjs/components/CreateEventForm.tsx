"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
// Icons
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle, ChevronRight, Download, Loader2, MapPin, Ticket, UploadCloud, UserCheck, Users, X } from "lucide-react";
import { toast } from "sonner";
// Replaces alerts
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "~~/components/ui/button";
import { Calendar } from "~~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~~/components/ui/popover";
import { EVENT_FACTORY_ABI, EVENT_FACTORY_ADDRESS } from "~~/contracts/config";
// UI Components
import { cn } from "~~/lib/utils";


export default function CreateEventForm() {
  // --- 1. STATE ---
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    capacity: "",
    ticketType: "free",
    price: "",
    requiresApproval: false,
  });

  // Split Date & Time for better UI control
  const [startDate, setStartDate] = useState<Date>();
  const [startTime, setStartTime] = useState("18:00");
  const [endDate, setEndDate] = useState<Date>();
  const [endTime, setEndTime] = useState("21:00");

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // IPFS States
  const [ipfsHash, setIpfsHash] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Blockchain Hooks
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // --- 2. HANDLERS ---

  const handleChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (Max 5MB)");
      return;
    }

    setBannerPreview(URL.createObjectURL(file));
    setIsUploading(true);

    // Create a promise for the toast
    const uploadPromise = fetch("/api/ipfs/upload", {
      method: "POST",
      body: (() => {
        const formData = new FormData();
        formData.append("file", file);
        return formData;
      })(),
    }).then(async res => {
      const data = await res.json();
      if (!data.ipfsHash) throw new Error("Upload failed");
      setIpfsHash(data.ipfsHash);
      return data.ipfsHash;
    });

    toast.promise(uploadPromise, {
      loading: "Uploading to IPFS...",
      success: "Banner pinned successfully!",
      error: "Failed to upload banner",
    });

    try {
      await uploadPromise;
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

   const removeImage = async (e: React.MouseEvent) => {
     e.stopPropagation();

     
     if (ipfsHash) {
       const loadingToast = toast.loading("Removing image...");
       try {
         await fetch("/api/ipfs/unpin", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ hash: ipfsHash }),
         });
         toast.dismiss(loadingToast);
         toast.success("Image removed from cloud");
       } catch (err) {
         console.error("Failed to unpin", err);
         
       }
     }

    
     setBannerPreview(null);
     setIpfsHash("");
     if (fileInputRef.current) fileInputRef.current.value = "";
   };

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();

    
     if (!formData.name) {
       toast.error("Event Name is required");
       return;
     }
     if (!startDate || !endDate) {
       toast.error("Please select start and end dates");
       return;
     }

    
     const startDateTime = new Date(`${format(startDate, "yyyy-MM-dd")}T${startTime}`);
     const endDateTime = new Date(`${format(endDate, "yyyy-MM-dd")}T${endTime}`);

     if (endDateTime <= startDateTime) {
       toast.error("End date must be after start date");
       return;
     }

    
     const startUnix = Math.floor(startDateTime.getTime() / 1000);
     const endUnix = Math.floor(endDateTime.getTime() / 1000);
     const capacityInt = parseInt(formData.capacity) || 100;

     try {
       writeContract({
         address: EVENT_FACTORY_ADDRESS,
         abi: EVENT_FACTORY_ABI,
         functionName: "createEvent",
         args: [formData.name, BigInt(startUnix), BigInt(endUnix), BigInt(capacityInt)],
       });
     } catch (err) {
       console.error(err);
       toast.error("Failed to trigger wallet");
     }
   };


  if (isConfirmed) {
    const qrData = JSON.stringify({ name: formData.name, tx: hash });
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&color=000000&bgcolor=ffffff`;

    return (
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-[#020410]/50 border border-[#CFFF04]/30 rounded-2xl p-12 shadow-2xl flex flex-col items-center backdrop-blur-md">
          <div className="w-20 h-20 bg-[#CFFF04]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(207,255,4,0.3)]">
            <CheckCircle className="text-[#CFFF04] w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Event Live!</h1>
          <p className="text-gray-400 mb-8 max-w-md">
            The contract for <span className="text-white font-semibold">{formData.name}</span> has been deployed.
          </p>
          <div className="bg-white p-4 rounded-2xl shadow-xl mb-8 transform hover:scale-105 transition-transform duration-300">
            <img src={qrUrl} alt="Event QR" className="w-48 h-48 rounded-lg" />
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
            <button
              onClick={() => window.open(qrUrl, "_blank")}
              className="px-8 py-3 rounded-xl bg-[#CFFF04] hover:bg-[#bce600] text-black font-bold transition-all flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download QR Kit
            </button>
            <Link
              href="/eventz"
              className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }


  if (isPending || isConfirming) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center -mt-20">
        <div className="relative">
          <div className="absolute inset-0 bg-[#CFFF04] blur-xl opacity-20 rounded-full animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-[#CFFF04] animate-spin relative z-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mt-8 mb-2">Deploying Contract...</h2>
        <p className="text-gray-400 text-sm">Encrypting metadata & initializing factory</p>
        {hash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-400 mt-6 hover:underline"
          >
            View on Etherscan
          </a>
        )}
      </div>
    );
  }


  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-12 pt-32 pb-20">
      <Link
        href="/eventz"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Events
      </Link>

      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Create Event
        </h1>
        <p className="text-gray-400 text-sm">Deploy a privacy-preserving event on Zama fhEVM</p>
      </div>

      <div className="bg-[#020410]/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            <div className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">Event Name</label>
                <input
                  value={formData.name}
                  onChange={e => handleChange("name", e.target.value)}
                  type="text"
                  placeholder="e.g. Crypto Art Gala"
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => handleChange("description", e.target.value)}
                  rows={4}
                  placeholder="Describe the vibes..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">Start</label>
                  <div className="flex gap-2">
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"ghost"}
                          className={cn(
                            "w-full justify-start text-left font-normal h-auto",
                            "bg-black/20 border border-white/10 rounded-xl p-4",

                            !startDate && "text-gray-500",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-blue-400" />
                          {startDate ? format(startDate, "PPP") : <span className="text-gray-500">Pick date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#020410] border-white/10 text-white" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className="bg-[#020410] text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                
                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">End</label>
                  <div className="flex gap-2">
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"ghost"}
                          className={cn(
                            "w-full justify-start text-left font-normal h-auto",
                            "bg-black/20 border border-white/10 rounded-xl p-4",
                            !startDate && "text-gray-500",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-blue-400" />
                          {endDate ? format(endDate, "PPP") : <span className="text-gray-500">Pick date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#020410] border-white/10 text-white" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          className="bg-[#020410] text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

             
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">Location</label>
                <div className="relative group">
                  <input
                    value={formData.location}
                    onChange={e => handleChange("location", e.target.value)}
                    type="text"
                    placeholder="e.g. Decentraland / NYC"
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all pl-12"
                  />
                  <MapPin className="absolute left-4 top-5 text-blue-400" size={16} />
                </div>
              </div>

             
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">Capacity</label>
                <div className="relative group">
                  <input
                    value={formData.capacity}
                    onChange={e => handleChange("capacity", e.target.value)}
                    type="number"
                    placeholder="100"
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all pl-12"
                  />
                  <Users
                    className="absolute left-4 top-5 group-focus-within:text-blue-400 transition-colors text-blue-400"
                    size={16}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 flex flex-col h-full">
             
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">Event Banner</label>
                <div
                  className="w-full h-48 border-2 border-dashed border-white/10 rounded-xl bg-black/20 relative flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all overflow-hidden group"
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                  />

                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                      <Loader2 className="w-8 h-8 text-[#CFFF04] animate-spin mb-2" />
                      <span className="text-xs text-[#CFFF04] font-bold">Uploading to IPFS...</span>
                    </div>
                  )}

                  {bannerPreview ? (
                    <>
                      <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                      {ipfsHash && !isUploading && (
                        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-[10px] text-[#CFFF04] border border-[#CFFF04]/30 font-mono backdrop-blur-md">
                          IPFS PINNED
                        </div>
                      )}
                      <div className="absolute top-2 right-2 z-20" onClick={removeImage}>
                        <div className="bg-red-500/80 hover:bg-red-500 p-1.5 rounded-full text-white backdrop-blur-sm transition-colors shadow-lg">
                          <X size={14} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                      <div className="p-4 bg-white/5 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud size={28} className="text-blue-400" />
                      </div>
                      <span className="text-xs font-medium">Click to upload banner</span>
                      <span className="text-[10px] text-gray-500 mt-1">Supports JPG, PNG (Max 5MB)</span>
                    </div>
                  )}
                </div>
              </div>

              
              <div className="p-6 rounded-xl bg-black/20 border border-white/10 space-y-6 flex-1 flex flex-col">
                <div>
                  <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-200">
                    <Ticket className="text-blue-400" size={16} /> Ticket Type
                  </div>
                  <div className="flex bg-black/40 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleChange("ticketType", "free")}
                      className={`flex-1 py-2 text-xs rounded-md font-bold transition-all ${formData.ticketType === "free" ? "bg-[#CFFF04] text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
                    >
                      Free
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange("ticketType", "paid")}
                      className={`flex-1 py-2 text-xs rounded-md font-bold transition-all ${formData.ticketType === "paid" ? "bg-[#CFFF04] text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
                    >
                      Paid
                    </button>
                  </div>
                  {formData.ticketType === "paid" && (
                    <div className="mt-3 animate-in slide-in-from-top-2">
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0.05"
                          className="w-full bg-black/20 border border-white/10 rounded-lg p-2 pl-8 text-sm text-white focus:border-[#CFFF04] focus:outline-none"
                        />
                        <span className="absolute left-3 top-2 text-gray-500 text-xs">Ξ</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg text-xs text-blue-300 leading-relaxed">
                  <p className="font-semibold mb-1">Privacy Architecture</p>
                  Events are deployed on Zama&apos;s fhEVM. Attendee data is encrypted end-to-end. Only you can decrypt
                  aggregate analytics.
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
                    <UserCheck className="text-blue-400" size={16} /> Require Approval
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange("requiresApproval", !formData.requiresApproval)}
                    className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${formData.requiresApproval ? "bg-[#CFFF04]" : "bg-gray-700"}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${formData.requiresApproval ? "left-6" : "left-1"}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

        
          <div className="mt-12 flex justify-center">
            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="group relative w-full md:w-2/3 bg-white hover:bg-gray-100 text-black font-semibold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Confirming..." : "Deploy Event Contract"}
              {!isPending && <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}