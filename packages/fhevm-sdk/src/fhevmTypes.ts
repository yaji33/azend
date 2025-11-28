import type {
  FhevmInstance as _FhevmInstance,
  FhevmInstanceConfig as _FhevmInstanceConfig,
} from "@zama-fhe/relayer-sdk/web"; 


export type FhevmInstance = _FhevmInstance;
export type FhevmInstanceConfig = _FhevmInstanceConfig;

// Placeholder types
export type HandleContractPair = any;
export type DecryptedResults = any;

export type FhevmDecryptionSignatureType = {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number;
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
  eip712: EIP712Type;
};

export type EIP712Type = {
  domain: {
    chainId: number;
    name: string;
    verifyingContract: `0x${string}`;
    version: string;
  };

  message: any;
  primaryType: string;
  types: {
    [key: string]: {
      name: string;
      type: string;
    }[];
  };
};
