export const FHEVM_CONFIG = {

  11155111: {
    chainId: 11155111,
    networkUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    relayerUrl: "https://relayer.testnet.zama.org", 
    gatewayUrl: "https://relayer.testnet.zama.org", 
    gatewayChainId: 55815, 
    kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
    aclContractAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
    inputVerifierContractAddress: "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4", 
    verifyingContractAddressDecryption: "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
    verifyingContractAddressInputVerification: "0x7048C39f048125eDa9d678AEbaDfB22F7900a29F",
  },
  8009: {
    chainId: 8009,
    networkUrl: "https://devnet.zama.ai",
    gatewayUrl: "https://relayer.devnet.zama.ai", 
    kmsContractAddress: undefined, 
    aclContractAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
  },
} as const;

export function getFhevmConfig(chainId?: number) {
  const config = chainId ? FHEVM_CONFIG[chainId as keyof typeof FHEVM_CONFIG] : undefined;

  if (!config) {
    console.warn(`No FHEVM config found for chainId ${chainId}. Using Sepolia defaults.`);
    return FHEVM_CONFIG[11155111];
  }

  return config;
}
