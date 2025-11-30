import deployedContracts from "./deployedContracts";


export const EVENT_FACTORY_ADDRESS = deployedContracts[11155111].EventFactory.address;
export const EVENT_FACTORY_ABI = deployedContracts[11155111].EventFactory.abi;


export const AZEND_EVENT_ABI = [
  
  { name: "eventName", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "description", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "location", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "bannerIpfsHash", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "startTime", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "endTime", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "capacity", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "organizer", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },

  
  { name: "isFreeEvent", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { name: "ticketPrice", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "requiresApproval", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },

  {
    name: "isApproved",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "requestData",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "string" }],
  }, 
  {
    name: "requestToJoin",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "metadata", type: "string" }], 
    outputs: [],
  },
  {
    name: "checkIn",
    type: "function",
    stateMutability: "payable", 
    inputs: [
      { name: "inputTimestamp", type: "bytes" },
      { name: "timestampProof", type: "bytes" },
      { name: "inputTicketType", type: "bytes" },
      { name: "ticketTypeProof", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

export const FHE_CHAIN = {
  id: 11155111,
  name: "Sepolia",
  rpcUrls: {
    default: {
      http: ["https://ethereum-sepolia-rpc.publicnode.com"],
    },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://sepolia.etherscan.io" },
  },
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "ETH",
    decimals: 18,
  },
};
