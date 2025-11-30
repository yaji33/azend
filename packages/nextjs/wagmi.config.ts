import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

// Get WalletConnect project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

console.log("🔧 Initializing Wagmi with direct Sepolia RPC");

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected(), metaMask(), ...(projectId ? [walletConnect({ projectId })] : [])],
  transports: {
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com", {
      // CRITICAL FIX: Disable batching and set proper limits
      batch: false, // Prevents gas estimation multiplication
      timeout: 30_000,
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
