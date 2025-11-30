import { useReadContracts } from "wagmi";
import { AZEND_EVENT_ABI } from "~~/contracts/config";

export const useEventData = (address: string) => {
  const contractAddress = address as `0x${string}`;

  const { data, isLoading } = useReadContracts({
    contracts: [
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "eventName" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "startTime" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "bannerIpfsHash" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "description" },
      { address: contractAddress, abi: AZEND_EVENT_ABI, functionName: "location" },
    ],
  });

  const name = data?.[0]?.status === "success" ? String(data[0].result) : "Loading...";
  const startUnix = data?.[1]?.status === "success" ? Number(data[1].result) : 0;
  const bannerHash = data?.[2]?.status === "success" ? String(data[2].result) : "";
  const description = data?.[3]?.status === "success" ? String(data[3].result) : "";
  const location = data?.[4]?.status === "success" ? String(data[4].result) : "";

  const imageUrl = bannerHash
    ? `https://gateway.pinata.cloud/ipfs/${bannerHash}`
    : "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200";

 
  const date =
    startUnix > 0 ? new Date(startUnix * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBA";

  return {
    address,
    name,
    description,
    location,
    date,
    imageUrl,
    isLoading,
  };
};
