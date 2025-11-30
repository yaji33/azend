import deployedContracts from "./deployedContracts";

export const EVENT_FACTORY_ADDRESS = deployedContracts[11155111].EventFactory.address;
export const EVENT_FACTORY_ABI = deployedContracts[11155111].EventFactory.abi;

export const AZEND_EVENT_ABI = [
  // View functions
  { name: "eventName", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "description", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "location", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "bannerIpfsHash", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "startTime", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "endTime", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "capacity", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "isFreeEvent", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { name: "ticketPrice", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "requiresApproval", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { name: "organizer", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { name: "useEncryptedCounter", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { name: "totalAttendeesPlain", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint32" }] },

  // Initialize
  {
    name: "initialize",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_organizer", type: "address" },
      { name: "_name", type: "string" },
      { name: "_description", type: "string" },
      { name: "_location", type: "string" },
      { name: "_bannerIpfsHash", type: "string" },
      { name: "_startTime", type: "uint256" },
      { name: "_endTime", type: "uint256" },
      { name: "_capacity", type: "uint256" },
      { name: "_isFreeEvent", type: "bool" },
      { name: "_ticketPrice", type: "uint256" },
      { name: "_requiresApproval", type: "bool" },
      { name: "_useEncryptedCounter", type: "bool" },
    ],
    outputs: [],
  },

  // Requests
  {
    name: "requestData",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "string" }],
  },
  {
    name: "hasRequested",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "isApproved",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "hasAttended",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "bool" }],
  },

  // Encrypted getters
  { name: "getMyPackedCheckIn", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bytes" }] },
  {
    name: "getTotalAttendeesEncrypted",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes" }],
  },
  {
    name: "getTotalAttendeesPlain",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint32" }],
  },

  // Core writes
  {
    name: "requestToJoin",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "metadata", type: "string" }],
    outputs: [],
  },
  {
    name: "approveUser",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "user", type: "address" }],
    outputs: [],
  },
  {
    name: "checkIn",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "inputPacked", type: "bytes" },
      { name: "packedProof", type: "bytes" },
    ],
    outputs: [],
  },
  { name: "withdrawFunds", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  {
    name: "getEventDetails",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { type: "string" },
      { type: "string" },
      { type: "string" },
      { type: "string" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "bool" },
      { type: "uint256" },
      { type: "bool" },
    ],
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
