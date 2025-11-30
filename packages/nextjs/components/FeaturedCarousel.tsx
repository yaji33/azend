"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEventData } from "~~/hooks/useEventData";

const CarouselSlide = ({ address, isActive }: { address: string; isActive: boolean }) => {
  const { name, description, date, imageUrl, isLoading } = useEventData(address);

  if (isLoading) return <div className="absolute inset-0 bg-[#020410] animate-pulse" />;

  return (
    <>
      <div
        className="w-full h-full bg-cover bg-center transition-transform duration-[2s] scale-105"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020410] via-[#020410]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col items-start z-10">
        <span className="bg-[#CFFF04] text-black text-xs font-bold px-3 py-1 rounded-full mb-4">Featured</span>
        <h2 className="text-4xl md:text-6xl font-black mb-2 tracking-tight text-white drop-shadow-lg uppercase">
          {name}
        </h2>
        <p className="text-gray-200 text-lg mb-6 max-w-xl line-clamp-2">{description}</p>
        <div className="flex items-center gap-4">
          <button className="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-[#CFFF04] transition-colors flex items-center gap-2">
            View Event <ArrowRight size={18} />
          </button>
          <div className="hidden md:flex flex-col border-l border-white/30 pl-4">
            <span className="text-xs text-gray-400">Date</span>
            <span className="font-bold text-lg">{date}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export const FeaturedCarousel = ({ addresses }: { addresses: string[] }) => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  // Filter to max 3 events
  const slides = addresses.slice(0, 3);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => nextSlide(), 6000);
    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    let newIndex = currentSlide + newDirection;
    if (newIndex >= slides.length) newIndex = 0;
    if (newIndex < 0) newIndex = slides.length - 1;
    setCurrentSlide(newIndex);
  };

  const nextSlide = () => paginate(1);
  const prevSlide = () => paginate(-1);

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 }),
  };

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-2xl group border border-white/10 mb-16">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={slides[currentSlide]}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
          className="absolute w-full h-full cursor-pointer"
          onClick={() => router.push(`/eventz/${slides[currentSlide]}`)}
        >
          <CarouselSlide address={slides[currentSlide]} isActive={true} />
        </motion.div>
      </AnimatePresence>

      {/* Controls only if multiple slides */}
      {slides.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md z-20 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={e => {
              e.stopPropagation();
              prevSlide();
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md z-20 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={e => {
              e.stopPropagation();
              nextSlide();
            }}
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-6 right-6 md:right-12 flex gap-2 z-20">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide ? "w-8 bg-[#CFFF04]" : "w-2 bg-white/50 hover:bg-white"
                }`}
                onClick={e => {
                  e.stopPropagation();
                  setDirection(index > currentSlide ? 1 : -1);
                  setCurrentSlide(index);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
