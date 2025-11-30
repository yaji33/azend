import deployedContracts from "./deployedContracts";


export const EVENT_FACTORY_ADDRESS = deployedContracts[11155111].EventFactory.address;
export const EVENT_FACTORY_ABI = deployedContracts[11155111].EventFactory.abi;


export const AZEND_EVENT_ABI = [
 
  "function eventName() view returns (string)",
  "function startTime() view returns (uint256)",
  "function endTime() view returns (uint256)",
  "function capacity() view returns (uint256)",
  "function organizer() view returns (address)",
  "function hasAttended(address user) view returns (bool)",
  "function getTotalAttendees() view returns (uint256)",
  "function getMyEncryptedTicketType() view returns (uint8)",


  "function checkIn(bytes inputTimestamp, bytes timestampProof, bytes inputTicketType, bytes ticketTypeProof) public",
] as const;


export const FHE_CHAIN = {
  id: 11155111,
  name: "Sepolia",
  rpcUrls: {
    default: { http: ["https://ethereum-sepolia-rpc.publicnode.com"] },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://sepolia.etherscan.io" },
  },
};
