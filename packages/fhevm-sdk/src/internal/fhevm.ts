import { isAddress, Eip1193Provider, JsonRpcProvider } from "ethers";
import { publicKeyStorageGet, publicKeyStorageSet } from "./PublicKeyStorage";
import { FhevmInstance } from "../fhevmTypes";

export class FhevmReactError extends Error {
  override name = "FhevmReactError";
  code: string;

  constructor(code: string, message?: string, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
  }
}

export class FhevmAbortError extends Error {
  constructor(message = "FHEVM operation was cancelled") {
    super(message);
    this.name = "FhevmAbortError";
  }
}

type FhevmRelayerStatusType = "creating";

export type FhevmCustomConfig = {
  aclContractAddress: string;
  kmsContractAddress?: string;
  relayerUrl?: string;
  networkUrl?: string;
};

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
  relayerUrl?: string;
  signal: AbortSignal;
  onStatusChange?: (status: FhevmRelayerStatusType) => void;
  config?: FhevmCustomConfig;
}): Promise<FhevmInstance> => {
  const {
    signal,
    onStatusChange,
    provider: providerOrUrl,
    mockChains,
    relayerUrl: paramRelayerUrl,
    config,
  } = parameters;

  const throwIfAborted = () => {
    if (signal.aborted) throw new FhevmAbortError();
  };

  const notify = (status: FhevmRelayerStatusType) => {
    if (onStatusChange) onStatusChange(status);
  };

  const { rpcUrl: resolvedRpcUrl, chainId } = await resolve(
    providerOrUrl,  
    mockChains
  );

  throwIfAborted();
  notify("creating");


  const { createInstance, initSDK, SepoliaConfig } = await import(
    "@zama-fhe/relayer-sdk/web"
  );

  await initSDK();

  const baseTemplate = SepoliaConfig;


  const effectiveRpcUrl =
    config?.networkUrl ||
    (typeof providerOrUrl === "string" ? providerOrUrl : resolvedRpcUrl) ||
    "https://ethereum-sepolia-rpc.publicnode.com";

  const effectiveRelayerUrl =
    config?.relayerUrl || paramRelayerUrl || "https://relayer.testnet.zama.org";

  const effectiveAcl = (config?.aclContractAddress ||
    baseTemplate.aclContractAddress) as `0x${string}`;
  const effectiveKms = config?.kmsContractAddress as `0x${string}` | undefined;

  const pub = await publicKeyStorageGet(effectiveAcl);

  const instanceConfig = {
    ...baseTemplate,
    chainId,
    networkUrl: effectiveRpcUrl,
    relayerUrl: effectiveRelayerUrl,
    gatewayUrl: effectiveRelayerUrl, 
    publicKey: pub?.publicKey || undefined,
    aclContractAddress: effectiveAcl,
    ...(effectiveKms && isAddress(effectiveKms)
      ? { kmsContractAddress: effectiveKms }
      : {}),
  };

  console.log("🚀 Creating FHEVM instance:", {
    chainId,
    relayer: instanceConfig.relayerUrl,
    acl: instanceConfig.aclContractAddress,
    kms: instanceConfig.kmsContractAddress || "N/A",
  });

  const instance = await createInstance(instanceConfig);

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
