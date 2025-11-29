"use client";

import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Ticket, UserCheck, MapPin, Users } from "lucide-react";

export default function CreateEventForm() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-12 pt-32 pb-20">
      
      {/* Back Link */}
      <Link 
        href="/eventz" 
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Events
      </Link>

      {/* Title Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Create Event</h1>
        <p className="text-gray-400 text-sm">Deploy a privacy-preserving event with encrypted attendance tracking</p>
      </div>

      {/* --- FORM CONTAINER --- */}
      <div className="bg-[#111633]/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 md:p-10 shadow-2xl">
        <form className="grid grid-cols-1 lg:grid-cols-2 gap-12" onSubmit={(e) => e.preventDefault()}>
          
          {/* LEFT COLUMN: Inputs */}
          <div className="space-y-6">
            
            {/* Event Name */}
            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-medium ml-1">Event Name</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-medium ml-1">Event Description</label>
              <textarea 
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
              />
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-medium ml-1">Start Date</label>
                <div className="relative">
                  <input 
                    type="datetime-local" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-all [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-medium ml-1">End Date</label>
                <div className="relative">
                  <input 
                    type="datetime-local" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-all [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-medium ml-1">Location</label>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-all pl-10"
                />
                <MapPin className="absolute left-3 top-3.5 text-gray-500" size={18} />
              </div>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-medium ml-1">Capacity</label>
              <div className="relative">
                <input 
                  type="number" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-all pl-10"
                />
                <Users className="absolute left-3 top-3.5 text-gray-500" size={18} />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Upload & Settings */}
          <div className="space-y-6 flex flex-col">
            
            {/* Banner Upload */}
            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-medium ml-1">Banner</label>
              <div className="w-full h-48 border-2 border-dashed border-white/10 rounded-lg bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors group">
                <div className="p-3 bg-white/10 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <ImageIcon className="text-gray-400" size={24} />
                </div>
                <span className="text-xs text-gray-400">Drag & drop or click here to upload</span>
              </div>
            </div>

            {/* Tickets Option */}
            <div className="pt-2">
              <button type="button" className="w-full flex items-center justify-between bg-[#2a325a]/50 hover:bg-[#2a325a] border border-white/10 p-4 rounded-lg text-left transition-colors group">
                <div className="flex items-center gap-3">
                  <Ticket className="text-blue-400" size={20} />
                  <span className="text-sm font-medium">Tickets</span>
                </div>
                <span className="text-xs text-gray-400 group-hover:text-white">Configure &rarr;</span>
              </button>
            </div>

            {/* Approval Option */}
            <div>
              <button type="button" className="w-full flex items-center gap-3 bg-[#2a325a]/50 hover:bg-[#2a325a] border border-white/10 p-4 rounded-lg text-left transition-colors">
                <UserCheck className="text-blue-400" size={20} />
                <span className="text-sm font-medium">Require Approval</span>
              </button>
            </div>

            {/* Submit Button */}
            <div className="mt-auto pt-6">
              <button 
                type="submit"
                className="w-full bg-gray-200 hover:bg-white text-black font-bold py-4 rounded-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                Create Event
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}