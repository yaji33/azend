<p align="center">
  <img src="https://github.com/user-attachments/assets/a34a26dc-66e2-421e-a2dd-0cc65a90f563" width="170" alt="AZEND Logo" />
</p>

<p align="center">
  <a href="https://azend.vercel.app/">
    <img src="https://img.shields.io/badge/demo-live-success" alt="Live Demo"/>
  </a>
  <a href="https://github.com/yaji33/azend/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-BSD%203--Clause%20Clear-blue.svg" alt="License"/>
  </a>
</p>

# AZEND: Confidential Event Management on FHEVM

> **A privacy-first ticketing and event management platform built on the Zama Protocol.**  
> *Submitted to the Zama Developer Program - Builder Track*

## 📖 Overview

**AZEND** redefines how we manage private gatherings and exclusive events on-chain. Traditional blockchain ticketing exposes attendee data, wallet connections, and movement history to the public. 

AZEND utilizes **Fully Homomorphic Encryption (FHE)** to ensure that ticket ownership, check-in status, and attendee lists remain encrypted on-chain. The smart contract validates check-in criteria (time, ticket validity) mathematically over encrypted data without ever revealing the underlying values to the public or validators.

---

## 🛠️ Tech Stack & Versioning

We are utilizing the latest **Zama v0.9** ecosystem tools to ensure compatibility with the Sepolia Testnet and Gateway.

### Core FHE Libraries
| Package | Version | Purpose |
| :--- | :--- | :--- |
| **`@fhevm/solidity`** | `v0.9.1` | **Smart Contracts.** Provides the `TFHE` library for on-chain encrypted operations (`euint64`, `ebool`, `TFHE.asEuint64`, `TFHE.le`). |
| **`@zama-fhe/relayer-sdk`** | `v0.3.0-5` | **Decryption/Gateway.** Crucial for v0.9: Enables the new self-relaying decryption model for viewing private analytics. |
| **`@fhevm/hardhat-plugin`** | `v0.3.0-1` | **Development.** Latest tooling support for deployment and local mocking. |
| **`fhevm`** | `latest` | **Client-Side Encryption.** Used for generating EIP-712 signatures and native encrypted inputs (`euint64` ciphertexts). |

### DApp Architecture
*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript
*   **Blockchain Interaction:** Wagmi v2, Viem, Ethers v6
*   **Storage:** IPFS (via **Pinata**) for Event Banners/Metadata
*   **Styling:** Tailwind CSS, Shadcn/UI, Lucide React

---

## 🔒 Confidential Architecture

AZEND demonstrates "Original Tech Architecture" by moving beyond simple encrypted counters. We implement a **Bitwise Packed Check-In System**.

### 1. The Encrypted Check-In Flow
Instead of sending separate encrypted values (which costs more gas), the client packs data into a single 64-bit integer before encryption.

1.  **Client Side:**
    *   We take the current **Timestamp** (32 bits).
    *   We take the **Ticket Type** (e.g., VIP=1, GA=2).
    *   We pack them: `packedValue = (Timestamp << 8) | TicketType`.
    *   We generate a **Native FHE Ciphertext** (approx 2kb) using the `fhevm` library.

2.  **On-Chain (Smart Contract):**
    *   The contract receives the ciphertext.
    *   It converts it to an `euint64` using `TFHE.asEuint64(input, proof)`.
    *   It validates the time window: `TFHE.le(packedTimestamp, eventEndTime)`.
    *   It updates the user's attendance status (`hasAttended[user]`) strictly using homomorphic logic.

---

## Use Case Diagram 
<img width="1238" height="800" alt="AZEND-UseCase-Diagram" src="https://github.com/user-attachments/assets/b36460b5-d371-45aa-9a8b-44fbab5fbf71" />

## Context FLow Diagram
<img width="1238" height="800" alt="AZEND-Context-Flow-Diagram" src="https://github.com/user-attachments/assets/93f84fbb-7d65-4d34-8ec0-6eafd840f153" />

## Sequence Diagram
<img width="1238" height="1132" alt="AZEND-Sequence-Diagram" src="https://github.com/user-attachments/assets/bab5d4e6-967c-4fa6-8094-065a5582f4d8" />


## 🚀 Getting Started

This is a **Monorepo** containing both the Hardhat environment and the Next.js frontend.

### Prerequisites
*   Node.js v20+
*   pnpm (recommended) or npm
*   Metamask (Configured for Sepolia)

### 1. Installation

```bash
https://github.com/yaji33/azend.git
cd azend

# Install dependencies for root, hardhat, and nextjs
pnpm install
```

### 2. Environment Setup

You must configure the environment variables for both the Smart Contract environment and the Frontend.

A. Hardhat Configuration

Create a file at packages/hardhat/.env
```
# Your Exported Wallet Private Key (Must have Sepolia ETH)
PRIVATE_KEY=0x...

# Standard Sepolia RPC (e.g., Alchemy, Infura, or Public Node)
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# For verifying contracts (Optional)
ETHERSCAN_API_KEY=...
```

B. Next.js Configuration

Create a file at packages/nextjs/.env.local:
```
# Pinata JWT for uploading Event Banners to IPFS
PINATA_JWT=...

# WalletConnect Project ID (from cloud.walletconnect.com)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...

# Public Sepolia RPC for the frontend to read chain data
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

### 3. Deploy Contracts (Optional)
The project comes with pre-configured addresses, but if you wish to deploy your own:
```
cd packages/hardhat
npx hardhat deploy --network sepolia
```

### Run the DApp
```
pnpm start
```
### 🧪 Testing

We have end-to-end tests ensuring the packing logic and encryption work correctly using the hardhat-fhevm mock mode.
```
cd packages/hardhat
npx hardhat test
```

Test Scenarios:
```
✅ Event Creation with encrypted boolean flags.
✅ Encrypted Check-In: Validating the bitwise packed timestamp logic via fhevm instance.
✅ Access Control: Verifying that only the organizer can request re-encryption of analytics.
```
