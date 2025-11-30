"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ArrowLeft, MapPin, Calendar, Users, QrCode, BarChart3, Shield, User, ExternalLink } from "lucide-react";
import Navbar from "../../../components/Navbar";
import LoginModal from "../../../components/LoginModal";
import { EVENTS_DATA } from "../../../utils/mockEvents";

export default function DashboardEventDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;
  
  // Gatekeeper
  if (!isConnected) {
    return <div className="min-h-screen bg-[#020410]"><LoginModal isOpen={true} onClose={() => router.push("/")} /></div>;
  }

  const event = EVENTS_DATA.find((e) => e.id.toString() === params.id);
  if (!event) return <div className="min-h-screen flex items-center justify-center text-white">Event not found</div>;

  return (
    <main 
      className="min-h-screen bg-[#021337] text-white font-sans selection:bg-[#CFFF04] selection:text-black"
      style={{
        background: "radial-gradient(circle at 50% 0%, rgba(16, 20, 50, 0.4) 0%, #020410 60%)"
      }}
    >
      <Navbar />
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 pt-32 pb-20">
        
        {/* Back Button */}
        <button 
        onClick={() => router.back()} 
        className="group flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm transition-colors"
        >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> 
        Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- LEFT COL: MAIN INFO --- */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Main Card */}
            <div className="bg-[#111633]/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              
              {/* 1. BANNER IMAGE (Fixed Height, Full Width) */}
              <div className="relative w-full h-64 shrink-0">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover" 
                />
                
                {/* Subtle Gradient at bottom of image for blending */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111633]/80 to-transparent opacity-60" />
                
                {/* Status Badge floating on the Banner */}
                <div className="absolute top-4 right-4">
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#CFFF04]/30 text-[#CFFF04] text-[10px] font-bold uppercase tracking-wider shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CFFF04] animate-pulse"></span>
                    Live Event
                  </span>
                </div>
              </div>

              {/* 2. CONTENT AREA (Below Banner) */}
              <div className="p-8 pt-6">
                
                {/* Header Row: Title & Analytics Button */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                    {event.title}
                  </h1>
                  
                </div>

                <p className="text-blue-200/70 text-sm leading-relaxed max-w-2xl mb-8">
                  {event.longDescription || event.description}
                </p>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Date Block */}
                  <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar size={18} className="text-blue-400" />
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Date</span>
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{event.date}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{event.time}</p>
                    </div>
                  </div>

                  {/* Location Block */}
                  <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin size={18} className="text-purple-400" />
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Location</span>
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm truncate">{event.location.split(',')[0]}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{event.venue}</p>
                    </div>
                  </div>

                  {/* Capacity Block */}
                  <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <Users size={18} className="text-[#CFFF04]" />
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Capacity</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1.5">
                        <p className="font-bold text-white text-sm">{event.attendees}</p>
                        <span className="text-[10px] text-[#CFFF04]">65%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#CFFF04] to-emerald-500 w-[65%] rounded-full" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>

        {/* --- RIGHT COL: ACTIONS --- */}
        <div className="space-y-6">
            
            {/* Check In / QR Card */}
            <div className="bg-[#192144] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#CFFF04]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <h3 className="text-sm font-bold text-gray-200 mb-6 flex items-center gap-2">
                <QrCode size={16} className="text-blue-400" /> Check-In Pass
            </h3>
            
            {/* QR Container with Scan Markers */}
            <div className="relative bg-white p-2 rounded-xl w-48 h-48 mx-auto mb-6 shadow-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-black -mt-1 -ml-1 rounded-tl-sm"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-black -mt-1 -mr-1 rounded-tr-sm"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-black -mb-1 -ml-1 rounded-bl-sm"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-black -mb-1 -mr-1 rounded-br-sm"></div>
                
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${event.id}`} className="w-full h-full object-contain" alt="Check-in QR" />
            </div>

            <p className="text-[10px] text-center text-gray-500 mb-4 px-4">
                Present this QR code at the venue entrance. It refreshes automatically.
            </p>

            <button className="w-full bg-[#CFFF04] hover:bg-[#bce600] text-black py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#CFFF04]/10 hover:shadow-[#CFFF04]/20 flex items-center justify-center gap-2">
                Download Pass <ExternalLink size={14} />
            </button>
            </div>

            {/* Analytics Action */}
            <div className="bg-[#111633]/40 border border-white/10 rounded-2xl p-6 ">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <User size={18} />
                </div>
                <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Organizer</p>
                <p className="text-sm -mt-4 font-bold text-white">{event.host}</p>
                </div>
            </div>
            
            <button 
                onClick={() => router.push(`/dashboard/${event.id}/analytics`)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 group"
            >
                <BarChart3 size={16} className="text-blue-400 group-hover:text-blue-400 transition-colors" /> 
                View Live Analytics
            </button>
            </div>
        </div>
       </div>
      </div>
    </main>
  );
}