"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Ticket, UserCheck, MapPin, Users, QrCode, Download, RefreshCw, X, UploadCloud, Calendar as CalendarIcon, ChevronRight } from "lucide-react";

export default function CreateEventForm() {
  // --- 1. STATE ---
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    capacity: "",
    ticketType: "free", 
    price: "",
    requiresApproval: false,
  });

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QR States
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- 2. HANDLERS ---

  const handleChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "name" || name === "startDate") setQrCodeUrl(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBannerPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerateQR = () => {
    if (!formData.name) {
      alert("Please enter an Event Name first.");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const uniqueData = `${formData.name}-${formData.startDate}-${Date.now()}`;
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(uniqueData)}&color=000000&bgcolor=ffffff`;
      setQrCodeUrl(url);
      setIsGenerating(false);
    }, 1500);
  };

  // Helper for Date Display
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "Pick a date";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-12 pt-32 pb-20">
      
      {/* Back Link */}
      <Link href="/eventz" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm font-medium">
        <ArrowLeft size={16} /> Back to Events
      </Link>

      {/* Title */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Create Event</h1>
        <p className="text-gray-400 text-sm">Deploy a privacy-preserving event with encrypted attendance tracking</p>
      </div>

      {/* --- FORM CONTAINER --- */}
      <div className="bg-[#020410]/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              
              {/* Event Name */}
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">Event Name</label>
                <input 
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  type="text" 
                  placeholder="e.g. Crypto Art Gala"
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">Event Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  placeholder="Describe the vibes..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative group">
                  <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">Start Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-4 w-4 text-blue-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <input 
                      type="datetime-local" 
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 pl-10 text-transparent focus:text-white placeholder-transparent focus:outline-none focus:border-blue-500 transition-all cursor-pointer z-10 relative"
                      onChange={(e) => handleChange("startDate", e.target.value)}
                    />
                    <div className="absolute inset-0 pl-10 flex items-center text-sm text-gray-300 pointer-events-none">
                       {formatDateDisplay(formData.startDate)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 relative group">
                  <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">End Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-4 w-4 text-blue-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <input 
                      type="datetime-local" 
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 pl-10 text-transparent focus:text-white placeholder-transparent focus:outline-none focus:border-blue-500 transition-all cursor-pointer z-10 relative"
                      onChange={(e) => handleChange("endDate", e.target.value)}
                    />
                    <div className="absolute inset-0 pl-10 flex items-center text-sm text-gray-300 pointer-events-none">
                       {formatDateDisplay(formData.endDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">Location</label>
                <div className="relative group">
                  <input 
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    type="text" 
                    placeholder="e.g. Decentraland / NYC"
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all pl-12"
                  />
                  <MapPin className="absolute left-4 top-5 text-blue-400 group-focus-within:text-blue-400 transition-colors" size={16} />
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">Capacity</label>
                <div className="relative group">
                  <input 
                    value={formData.capacity}
                    onChange={(e) => handleChange("capacity", e.target.value)}
                    type="number" 
                    placeholder="100"
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all pl-12"
                  />
                  <Users className="absolute left-4 top-5 group-focus-within:text-blue-400 transition-colors text-blue-400" size={16} />
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN - ADDED h-full AND flex-col to match height */}
            <div className="space-y-6 flex flex-col h-full">
              
              {/* QR GENERATOR */}
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">Check-in QR</label>
                <div className="bg-black/20 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden group transition-all hover:border-blue-500/30 shadow-inner">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f4f4f_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  
                  {qrCodeUrl ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 z-10 w-full">
                      <div className="bg-white p-3 rounded-lg shadow-lg mb-4">
                        <img src={qrCodeUrl} alt="QR" className="w-24 h-24" />
                      </div>
                      <div className="flex gap-2 w-full">
                        <button onClick={handleGenerateQR} className="flex-1 text-xs bg-white/5 hover:bg-white/10 py-2 rounded text-gray-300 flex items-center justify-center gap-2"><RefreshCw size={14}/> Regenerate</button>
                        <button onClick={() => window.open(qrCodeUrl, '_blank')} className="flex-1 text-xs bg-[#CFFF04] hover:bg-[#bce600] text-black font-bold py-2 rounded flex items-center justify-center gap-2"><Download size={14}/> Download</button>
                      </div>
                    </div>
                  ) : (
                    <div className="z-10 text-center">
                      <button 
                        onClick={handleGenerateQR}
                        disabled={isGenerating}
                        className="bg-[#CFFF04] hover:bg-[#bce600] text-black px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-[#CFFF04]/20 transition-all flex items-center gap-2"
                      >
                        {isGenerating ? <RefreshCw className="animate-spin" size={16}/> : <QrCode size={16}/>}
                        {isGenerating ? "Generating..." : "Generate QR Code"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* BANNER UPLOAD */}
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-medium ml-1 uppercase tracking-wider">Event Banner</label>
                <div 
                  className="w-full h-40 border-2 border-dashed border-white/10 rounded-xl bg-black/20 relative flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-blue-500/50 transition-all group overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  {bannerPreview ? (
                    <>
                      <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2">
                        <button onClick={removeImage} className="bg-red-500/80 hover:bg-red-500 p-1.5 rounded-full text-white backdrop-blur-sm transition-colors"><X size={14} /></button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-blue-500/10 rounded-full mb-3 text-blue-400 group-hover:scale-110 transition-transform">
                        <UploadCloud size={24} />
                      </div>
                      <span className="text-xs text-gray-400 font-medium">Click to upload banner</span>
                    </>
                  )}
                </div>
              </div>

              {/* SETTINGS CARD - Added 'flex-1' to stretch and match left column height */}
              <div className="p-5 rounded-xl bg-black/20 border border-white/10 space-y-5 flex-1 flex flex-col justify-center">
                
                {/* Tickets */}
                <div>
                  <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-200">
                    <Ticket className="text-blue-400" size={16} /> Ticket Type
                  </div>
                  <div className="flex bg-black/40 p-1 rounded-lg">
                    <button 
                      onClick={() => handleChange("ticketType", "free")}
                      className={`flex-1 py-2 text-xs rounded-md font-bold transition-all ${formData.ticketType === "free" ? "bg-[#CFFF04] text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
                    >
                      Free
                    </button>
                    <button 
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

                {/* Approval */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
                    <UserCheck className="text-blue-400" size={16} /> Require Approval
                  </div>
                  <button 
                    onClick={() => handleChange("requiresApproval", !formData.requiresApproval)}
                    className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${formData.requiresApproval ? "bg-[#CFFF04]" : "bg-gray-700"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${formData.requiresApproval ? "left-6" : "left-1"}`} />
                  </button>
                </div>

              </div>

            </div>
          </div>

          {/* --- SUBMIT BUTTON --- */}
          <div className="mt-12 flex justify-center">
            <button 
              type="submit"
              className="group relative w-full md:w-2/3 bg-white hover:bg-gray-100 text-black font-extrabold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
            >
              Create Event 
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}