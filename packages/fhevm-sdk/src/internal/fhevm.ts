import { isAddress, Eip1193Provider, JsonRpcProvider } from "ethers";
// import { createInstance } from "@zama-fhe/relayer-sdk/web";
import { publicKeyStorageGet, publicKeyStorageSet } from "./PublicKeyStorage";
import { FhevmInstance } from "../fhevmTypes";
import { ACL_ADDRESS } from "./constants";

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

async function getWeb3Client(rpcUrl: string) {
  const rpc = new JsonRpcProvider(rpcUrl);
  try {
    const version = await rpc.send("web3_clientVersion", []);
    return version;
  } catch (e) {
    throwFhevmError(
      "WEB3_CLIENTVERSION_ERROR",
      `The URL ${rpcUrl} is not a Web3 node or is not reachable. Please check the endpoint.`,
      e
    );
  } finally {
    rpc.destroy();
  }
}

async function tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl: string): Promise<
  | {
      ACLAddress: `0x${string}`;
      InputVerifierAddress: `0x${string}`;
      KMSVerifierAddress: `0x${string}`;
    }
  | undefined
> {
  const version = await getWeb3Client(rpcUrl);
  if (
    typeof version !== "string" ||
    !version.toLowerCase().includes("hardhat")
  ) {
    // Not a Hardhat Node
    return undefined;
  }
  try {
    const metadata = await getFHEVMRelayerMetadata(rpcUrl);
    if (!metadata || typeof metadata !== "object") {
      return undefined;
    }
    // Basic validation
    if (
      !metadata.ACLAddress ||
      !metadata.InputVerifierAddress ||
      !metadata.KMSVerifierAddress
    ) {
      return undefined;
    }
    return metadata;
  } catch {
    return undefined;
  }
}

async function getFHEVMRelayerMetadata(rpcUrl: string) {
  const rpc = new JsonRpcProvider(rpcUrl);
  try {
    const version = await rpc.send("fhevm_relayer_metadata", []);
    return version;
  } catch (e) {
    throwFhevmError(
      "FHEVM_RELAYER_METADATA_ERROR",
      `The URL ${rpcUrl} is not a FHEVM Hardhat node or is not reachable. Please check the endpoint.`,
      e
    );
  } finally {
    rpc.destroy();
  }
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

  // 1. MOCK / LOCAL HARDHAT LOGIC
  /*if (isMock) {
    const fhevmRelayerMetadata =
      await tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl);
    if (fhevmRelayerMetadata) {
      notify("creating");
      const fhevmMock = await import("./mock/fhevmMock");
      const mockInstance = await fhevmMock.fhevmMockCreateInstance({
        rpcUrl,
        chainId,
        metadata: fhevmRelayerMetadata,
      });
      throwIfAborted();
      return mockInstance;
    }
  }*/

  // 2. REAL FHEVM LOGIC
  throwIfAborted();
  notify("creating");

  // DYNAMIC IMPORT 
  // Import the SDK here so it only runs on the client,
  // preventing "self is not defined" errors during SSR.
  const { createInstance } = await import("@zama-fhe/relayer-sdk/web");

  const effectiveRpcUrl =
    typeof providerOrUrl === "string"
      ? providerOrUrl
      : "https://devnet.zama.ai";

  const pub = await publicKeyStorageGet(ACL_ADDRESS);

  const instance = await createInstance({
    chainId,
    network: effectiveRpcUrl,
    gatewayChainId: chainId,
    publicKey: pub?.publicKey || undefined,
  } as any);

  if (instance.getPublicKey()) {
    const publicParams = instance.getPublicParams(2048);

    if (publicParams) {
      await publicKeyStorageSet(
        ACL_ADDRESS,
        instance.getPublicKey()!,
        publicParams
      );
    }
  }

  throwIfAborted();

  return instance;
};
