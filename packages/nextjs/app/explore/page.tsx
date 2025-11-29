"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi"; // 1. Import Wagmi
import ConnectLock from "../../components/ConnectLock"; // 2. Import Lock
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Calendar, MapPin, Users, ShieldCheck, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowRight, X, Filter } from "lucide-react";
import Navbar from "../../components/Navbar";
import LoginModal from "../../components/LoginModal";

// --- MOCK DATA ---
const MOCK_EVENTS = [
  {
    id: 1,
    title: "Brews & Beats: Coffee Rave",
    description: "Experience the ultimate caffeine-fueled dance party.",
    date: "Dec 10-15, 2025",
    location: "Taguig City",
    attendees: 3247,
    capacity: 5000,
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600",
    category: "Music",
  },
  {
    id: 2,
    title: "Neon Nights: Art Gallery",
    description: "Immersive digital art exhibition with live synthwave.",
    date: "Jan 20, 2026",
    location: "BGC Arts Center",
    attendees: 1500,
    capacity: 2000,
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=600",
    category: "Art",
  },
  {
    id: 3,
    title: "Fashion Week: Runway",
    description: "Exclusive look at the 2026 Summer Collection.",
    date: "Feb 14, 2026",
    location: "Okada Manila",
    attendees: 800,
    capacity: 1000,
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600",
    category: "Fashion",
  },
  {
    id: 4,
    title: "Tech Innovators Summit",
    description: "Where the future is built.",
    date: "Jan 12, 2026",
    location: "Taguig City",
    attendees: 1200,
    capacity: 1500,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600",
    category: "Tech",
  },
  {
    id: 5,
    title: "Cyberpunk Cosplay Expo",
    description: "Costume contest and gaming convention.",
    date: "Mar 05, 2026",
    location: "Pasay City",
    attendees: 5000,
    capacity: 8000,
    image: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?q=80&w=600",
    category: "Gaming",
  }
];

const FEATURED_SLIDES = [
  {
    id: 1,
    title: "TECH INNOVATORS SUMMIT",
    subtitle: "Where the future is built.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200",
    date: "JAN 12",
    tag: "Networking"
  },
  {
    id: 2,
    title: "METAVERSE MUSIC FESTIVAL",
    subtitle: "The biggest digital sound experience",
    image: "https://images.unsplash.com/photo-1470229722913-7c0d2dbbafd3?q=80&w=1200",
    date: "NOV 28",
    tag: "Trending"
  },
  {
    id: 3,
    title: "CRYPTO ART WEEK",
    subtitle: "NFTs, Digital Sculptures & Live Auctions",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200",
    date: "DEC 05",
    tag: "Exclusive"
  }
];

// Available Filter Options
const LOCATIONS = ["All", "Taguig City", "BGC Arts Center", "Okada Manila", "Pasay City"];
const CATEGORIES = ["All", "Music", "Art", "Fashion", "Tech", "Gaming"];

export default function ExploreEvents() {
  const router = useRouter();
  
  // --- 3. GATEKEEPER LOGIC ---
  const { isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // --- CAROUSEL LOGIC ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => nextSlide(), 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    let newIndex = currentSlide + newDirection;
    if (newIndex >= FEATURED_SLIDES.length) newIndex = 0;
    if (newIndex < 0) newIndex = FEATURED_SLIDES.length - 1;
    setCurrentSlide(newIndex);
  };

  const nextSlide = () => paginate(1);
  const prevSlide = () => paginate(-1);
  const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

  // --- FILTERING LOGIC ---
  const filteredEvents = MOCK_EVENTS.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === "All" || event.location === selectedLocation;
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;

    return matchesSearch && matchesLocation && matchesCategory;
  });

  const clearFilters = () => {
    setSelectedLocation("All");
    setSelectedCategory("All");
    setSearchQuery("");
    setIsFilterOpen(false);
  };

  // Slider Variants
  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 })
  };
  if (!isMounted) return null;

  // --- 2. CHECK CONNECTION & USE LOGIN MODAL ---
  if (!isConnected) {
    return (
      // We wrap it in a dark div so the background isn't white
      <div className="min-h-screen bg-[#020410]">
        <LoginModal 
          isOpen={true} 
          // If they click 'X', we send them back to the Landing Page
          onClose={() => router.push("/")} 
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#021338] text-white font-sans selection:bg-[#CFFF04] selection:text-black">
      <Navbar />

      {/* --- FILTER MODAL --- */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#111633] border border-white/10 p-8 rounded-2xl w-full max-w-lg shadow-2xl z-[210]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Filter size={20} className="text-[#CFFF04]"/> Filter Events
                </h3>
                <button onClick={() => setIsFilterOpen(false)} className="hover:text-red-400"><X size={24}/></button>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Location</label>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map(loc => (
                    <button
                      key={loc}
                      onClick={() => setSelectedLocation(loc)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                        selectedLocation === loc 
                        ? "bg-[#CFFF04] text-black border-[#CFFF04] font-bold" 
                        : "bg-white/5 border-white/10 hover:border-white/30"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <label className="text-sm text-gray-400 mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                        selectedCategory === cat 
                        ? "bg-[#CFFF04] text-black border-[#CFFF04]  font-bold" 
                        : "bg-white/5 border-white/10 hover:border-white/30"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={clearFilters} className="flex-1 py-3 rounded-xl border border-white/20 hover:bg-white/10">Clear All</button>
                 <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-3 text-[black] rounded-xl bg-white font-bold  shadow-lg shadow-blue-900/40">Apply Filters</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-32 pb-20">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Explore Events</h1>
            <p className="text-gray-400 text-sm max-w-md">
              Discover privacy-first events and check in securely
            </p>
          </div>
          
          <button
            onClick={() => router.push("/eventz/create")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-black font-bold text-sm transition-transform hover:scale-105 bg-gray-200 hover:bg-white"
          >
            <Plus size={16} /> Create Event
          </button>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="relative mb-12">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search events by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1F36] border border-white/5 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>

        {/* --- FEATURED CAROUSEL --- */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            Featured Events <span className="text-[#CFFF04] animate-pulse">●</span>
          </h2>
          
          <div className="relative w-full h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-2xl group border border-white/10">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -10000) nextSlide();
                  else if (swipe > 10000) prevSlide();
                }}
                className="absolute w-full h-full cursor-grab active:cursor-grabbing"
              >
                <div 
                  className="w-full h-full bg-cover bg-center transition-transform duration-[2s] scale-105"
                  style={{ backgroundImage: `url(${FEATURED_SLIDES[currentSlide].image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020410] via-[#020410]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col items-start z-10">
                  <span className="bg-[#CFFF04] text-black text-xs font-bold px-3 py-1 rounded-full mb-4">
                    {FEATURED_SLIDES[currentSlide].tag}
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black mb-2 tracking-tight text-white drop-shadow-lg">
                    {FEATURED_SLIDES[currentSlide].title}
                  </h2>
                  <p className="text-gray-200 text-lg mb-6 max-w-xl">
                    {FEATURED_SLIDES[currentSlide].subtitle}
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-[#CFFF04] transition-colors flex items-center gap-2">
                      Get Tickets <ArrowRight size={18} />
                    </button>
                    <div className="hidden md:flex flex-col border-l border-white/30 pl-4">
                       <span className="text-xs text-gray-400">Date</span>
                       <span className="font-bold text-lg">{FEATURED_SLIDES[currentSlide].date}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            {/* Arrows */}
            <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md z-20 opacity-0 group-hover:opacity-100 transition-opacity" onClick={prevSlide}><ChevronLeft size={24} /></button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md z-20 opacity-0 group-hover:opacity-100 transition-opacity" onClick={nextSlide}><ChevronRight size={24} /></button>
            {/* Dots */}
            <div className="absolute bottom-6 right-6 md:right-12 flex gap-2 z-20">
              {FEATURED_SLIDES.map((_, index) => (
                <div key={index} className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide ? "w-8 bg-[#CFFF04]" : "w-2 bg-white/50 hover:bg-white"}`} onClick={() => { setDirection(index > currentSlide ? 1 : -1); setCurrentSlide(index); }} />
              ))}
            </div>
          </div>
        </div>

        {/* --- FILTER & GRID --- */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">
               {selectedCategory === "All" ? "All Events" : `${selectedCategory} Events`}
            </h2>
            {selectedLocation !== "All" && (
                <span className="text-xs bg-white/10 px-2 py-1 rounded border border-white/20 text-gray-300">
                    in {selectedLocation}
                </span>
            )}
          </div>
          
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-black text-md bg-white transition-colors shadow-lg "
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {/* THE GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="bg-[#192144] rounded-xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold border border-white/10">
                    {event.category}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#192144] to-transparent opacity-60" />
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                <p className="text-gray-400 text-xs mb-4">{event.description}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Calendar size={16} className="text-blue-400" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <MapPin size={16} className="text-blue-400" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Users size={16} className="text-blue-400" />
                    <span>{event.attendees} / {event.capacity} attendees</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-400">65% capacity</span>
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <ShieldCheck size={14} />
                    <span className="text-xs font-medium">Private Check-In</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 mt-6">
            <Search className="mx-auto h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search query.</p>
            <button onClick={clearFilters} className="text-blue-400 hover:text-blue-300 underline">Clear all filters</button>
          </div>
        )}
      </div>
    </main>
  );
}