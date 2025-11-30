"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi"; 
import LoginModal from "../components/LoginModal"; // Recommended import style

export default function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    if (isConnected) {
      setIsLoginOpen(false);
    }
  }, [isConnected]);

  const navLinks = [
    
    { name: "Explore", href: "/explore" }, 
    { name: "Events", href: "/my-events" }, 
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] flex justify-between items-center px-6 md:px-12 py-6 pointer-events-none">
        
        {/* 1. Logo */}
        <div className="pointer-events-auto">
          <Link href="/" className="font-serif text-2xl font-bold tracking-wide text-white">
            AZEND
          </Link>
        </div>

        {/* 2. Navigation Links */}
        <div className="hidden md:flex items-center gap-10 pointer-events-auto bg-black/20 backdrop-blur-md px-8 py-2 rounded-full border border-white/5">
          {navLinks.map((link, index) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
            return (
              <Link
                key={index}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-300 ${
                  isActive ? "text-[#CFFF04]" : "text-gray-300 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* 3. Connect Wallet Button */}
        <div className="pointer-events-auto">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div {...(!ready && { "aria-hidden": true, "style": { opacity: 0, pointerEvents: "none", userSelect: "none" } })}>
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={() => setIsLoginOpen(true)} 
                          className="text-[#131313] px-6 py-3 rounded-lg font-medium text-sm transition-all hover:scale-105 shadow-lg"
                          style={{ background: "white" }}
                        >
                          Connect Wallet
                        </button>
                      );
                    }
                    if (chain.unsupported) {
                      return <button onClick={openChainModal} className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium text-sm">Wrong network</button>;
                    }
                    return (
                      <button
                        onClick={openAccountModal}
                        // 🔴 FIX: Changed text-white to text-black so it is visible on white bg
                        className="text-black px-6 py-3 rounded-lg font-medium text-sm border border-white/10 shadow-lg"
                        style={{ background: "white" }}
                      >
                        {account.displayName}
                      </button>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </nav>

      <LoginModal 
        isOpen={isLoginOpen && !isConnected} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </>
  );
}