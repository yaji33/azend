"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { User, Calendar, MapPin, UserCheck, Share2, ArrowLeft } from "lucide-react";
import Navbar from "../../../components/Navbar";
import LoginModal from "../../../components/LoginModal";
import { EVENTS_DATA } from "../../../utils/mockEvents"; // 1. Import Shared Data

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  // 2. GATEKEEPER
  if (!isConnected) {
    return <div className="min-h-screen bg-[#020410]"><LoginModal isOpen={true} onClose={() => router.push("/")} /></div>;
  }

  // 3. FIND EVENT DATA
  const event = EVENTS_DATA.find((e) => e.id.toString() === params.id);

  // 4. HANDLE "NOT FOUND"
  if (!event) {
    return (
      <main className="min-h-screen bg-[#020410] text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
        <button onClick={() => router.push("/eventz")} className="text-blue-400 underline">Return to Events</button>
      </main>
    );
  }

  // 5. RENDER DYNAMIC DATA
  return (
    <main className="min-h-screen bg-[#020410] text-white font-sans selection:bg-[#CFFF04] selection:text-black">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-28 pb-20">
        
        {/* Back Button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
           <ArrowLeft size={18} /> Back
        </button>

        {/* HERO BANNER (Dynamic Image & Title) */}
        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-10 group border border-white/10">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020410] via-transparent to-transparent opacity-90"></div>
          <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center justify-center text-center">
             <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 tracking-tighter drop-shadow-2xl">
               {event.title.toUpperCase()}
             </h1>
             <p className="text-blue-300 font-bold tracking-[0.3em] text-xs md:text-sm mt-2 uppercase">{event.category} EVENT</p>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT: Details */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-3"><User className="text-blue-500" size={18} /><span>Hosted by <span className="text-white font-medium">{event.host}</span></span></div>
                <div className="flex items-center gap-3"><Calendar className="text-blue-500" size={18} /><span>{event.date} • {event.time}</span></div>
                <div className="flex items-center gap-3"><MapPin className="text-blue-500" size={18} /><span>{event.location}</span></div>
              </div>
            </div>

            {/* Registration Box */}
            <div className="bg-[#192144] rounded-xl overflow-hidden border border-white/10 shadow-lg">
              <div className="bg-[#232d5b] p-4 border-b border-white/10"><h3 className="text-sm font-semibold text-gray-200">Registration</h3></div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4 text-blue-400 text-sm"><UserCheck size={16} /><span>Approval Required</span></div>
                <p className="text-sm text-gray-400 mb-6">Welcome! To join the event, please register below.</p>
                <button className="w-full bg-[#E0E0E0] hover:bg-white text-black font-bold py-3 rounded-md transition-colors shadow-lg">Request to join</button>
              </div>
            </div>

            {/* About */}
            <div>
              <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">About Event</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{event.longDescription}</p>
            </div>

            {/* Location Map */}
            <div>
              <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">Location</h3>
              <div className="mb-2"><p className="font-medium text-white">{event.venue}</p><p className="text-sm text-gray-400">{event.location}</p></div>
              <div className="w-full h-64 rounded-xl overflow-hidden border border-white/10 mt-4 relative group">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000" alt="Map" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><div className="text-red-500 drop-shadow-lg"><MapPin size={40} fill="currentColor" /></div></div>
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="bg-[#192144] rounded-xl p-1 border border-white/10 shadow-2xl">
                <div className="bg-[#111633] rounded-lg p-6 flex flex-col items-center text-center">
                  <h3 className="text-sm font-medium text-gray-300 mb-4 w-full text-left">Check in</h3>
                  <div className="bg-white p-3 rounded-xl mb-4">
                    {/* Generates a QR based on Event ID + Title */}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(event.title + "-" + event.id)}`} alt="QR Code" className="w-40 h-40" />
                  </div>
                  <p className="text-[10px] text-gray-400">Scan this QR code at the venue to check in privately</p>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white py-3 rounded-xl transition-colors text-sm"><Share2 size={16} /> Share Event</button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}