"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Navbar from "../../../components/Navbar";
import LoginModal from "../../../components/LoginModal";
import CreateEventForm from "../../../components/CreateEventForm"; // Import your new component

export default function CreateEventPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // --- 1. GATEKEEPER: Secure the page ---
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#020410]">
        <LoginModal 
          isOpen={true} 
          onClose={() => router.push("/")} 
        />
      </div>
    );
  }

  // --- 2. RENDER THE PAGE ---
  return (
    <main 
      className="min-h-screen bg-[#021337] text-white font-sans selection:bg-[#CFFF04] selection:text-black"
    >
      <Navbar />
      
      {/* Load the Form Component */}
      <CreateEventForm />
      
    </main>
  );
}