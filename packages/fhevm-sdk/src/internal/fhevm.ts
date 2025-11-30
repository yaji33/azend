import { isAddress, Eip1193Provider, JsonRpcProvider } from "ethers";
// import { createInstance } from "@zama-fhe/relayer-sdk/web";
import { publicKeyStorageGet, publicKeyStorageSet } from "./PublicKeyStorage";
import { FhevmInstance } from "../fhevmTypes";
import {
  ACL_ADDRESS_DEVNET,
  ACL_ADDRESS_SEPOLIA,
  KMS_VERIFIER_SEPOLIA,
} from "./constants";

export class FhevmReactError extends Error {
  override name = "FhevmReactError";
  code: string;

  constructor(code: string, message?: string, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
  }
}

function throwFhevmError(
  code: string,
  message?: string,
  cause?: unknown
): never {
  throw new FhevmReactError(code, message, cause ? { cause } : undefined);
}

export class FhevmAbortError extends Error {
  constructor(message = "FHEVM operation was cancelled") {
    super(message);
    this.name = "FhevmAbortError";
  }
}

type FhevmRelayerStatusType = "creating";

async function getChainId(
  providerOrUrl: Eip1193Provider | string
): Promise<number> {
  if (typeof providerOrUrl === "string") {
    const provider = new JsonRpcProvider(providerOrUrl);
    return Number((await provider.getNetwork()).chainId);
  }
  const chainId = await providerOrUrl.request({ method: "eth_chainId" });
  return Number.parseInt(chainId as string, 16);
}

// ... (Keep getWeb3Client, tryFetchFHEVMHardhatNodeRelayerMetadata, getFHEVMRelayerMetadata, resolve, etc. exactly as they were) ...

type MockResolveResult = { isMock: true; chainId: number; rpcUrl: string };
type GenericResolveResult = { isMock: false; chainId: number; rpcUrl?: string };
type ResolveResult = MockResolveResult | GenericResolveResult;

async function resolve(
  providerOrUrl: Eip1193Provider | string,
  mockChains?: Record<number, string>
): Promise<ResolveResult> {
  const chainId = await getChainId(providerOrUrl);
  let rpcUrl = typeof providerOrUrl === "string" ? providerOrUrl : undefined;

  const _mockChains: Record<number, string> = {
    31337: "http://localhost:8545",
    ...(mockChains ?? {}),
  };

  if (Object.hasOwn(_mockChains, chainId)) {
    if (!rpcUrl) {
      rpcUrl = _mockChains[chainId];
    }
    return { isMock: true, chainId, rpcUrl };
  }

  return { isMock: false, chainId, rpcUrl };
}

export const createFhevmInstance = async (parameters: {
  provider: Eip1193Provider | string;
  mockChains?: Record<number, string>;
  gatewayUrl?: string;
  signal: AbortSignal;
  onStatusChange?: (status: FhevmRelayerStatusType) => void;
}): Promise<FhevmInstance> => {
  const {
    signal,
    onStatusChange,
    provider: providerOrUrl,
    mockChains,
    gatewayUrl = "https://gateway.zama.ai",
  } = parameters;

  const throwIfAborted = () => {
    if (signal.aborted) throw new FhevmAbortError();
  };

  const notify = (status: FhevmRelayerStatusType) => {
    if (onStatusChange) onStatusChange(status);
  };

  const { rpcUrl, chainId } = await resolve(providerOrUrl, mockChains);

  // 1. MOCK / LOCAL HARDHAT LOGIC (Skipped for now)

  // 2. REAL FHEVM LOGIC
  throwIfAborted();
  notify("creating");

  const { createInstance } = await import("@zama-fhe/relayer-sdk/web");

  // --- LOGIC START: Determine RPC and ACL based on Chain ID ---
  let effectiveRpcUrl =
    typeof providerOrUrl === "string" ? providerOrUrl : rpcUrl;

  // 🔴 FIX: Explicitly type this as `0x${string}` and cast the constant
  let effectiveAcl: `0x${string}` = ACL_ADDRESS_SEPOLIA as `0x${string}`;
  let effectiveKms: `0x${string}` | undefined =
    KMS_VERIFIER_SEPOLIA as `0x${string}`;

  if (chainId === 11155111) {
    // Sepolia
    effectiveAcl = ACL_ADDRESS_SEPOLIA as `0x${string}`;
    effectiveKms = KMS_VERIFIER_SEPOLIA as `0x${string}`;
    if (!effectiveRpcUrl) {
      effectiveRpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";
    }
  } else if (chainId === 8009) {
    // Zama Devnet
    effectiveAcl = ACL_ADDRESS_DEVNET as `0x${string}`;
    effectiveKms = undefined;
    if (!effectiveRpcUrl) {
      effectiveRpcUrl = "https://devnet.zama.ai";
    }
  } else {
    // Fallback if rpcUrl is undefined
    if (!effectiveRpcUrl) {
      effectiveRpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";
    }
  }
  // --- LOGIC END ---

  const pub = await publicKeyStorageGet(effectiveAcl);

  const instance = await createInstance({
    chainId,
    networkUrl: effectiveRpcUrl,
    gatewayUrl: gatewayUrl,
    publicKey: pub?.publicKey || undefined,
    aclContractAddress: effectiveAcl, 
    kmsContractAddress: effectiveKms,
  } as any);

  if (instance.getPublicKey()) {
    const publicParams = instance.getPublicParams(2048);
    if (publicParams) {
      await publicKeyStorageSet(
        effectiveAcl,
        instance.getPublicKey()!,
        publicParams
      );
    }
  }

  throwIfAborted();

  return instance;
};
