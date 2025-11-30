import { ethers } from "hardhat";

async function main() {
  const eventAddress = "0xCa6fF056938A8f8E7454B4CFE69125A82a28A1eE";

  console.log("Testing contract at:", eventAddress);
  console.log("=".repeat(50));

  // Check if contract exists
  const code = await ethers.provider.getCode(eventAddress);
  console.log("Contract exists:", code !== "0x");
  console.log("Code length:", code.length);

  // Try to read using the ABI
  const abi = [
    "function eventName() view returns (string)",
    "function startTime() view returns (uint256)",
    "function endTime() view returns (uint256)",
    "function capacity() view returns (uint256)",
    "function organizer() view returns (address)",
  ];

  const event = await ethers.getContractAt(abi, eventAddress);

  console.log("\nTrying to read contract data...\n");

  try {
    const name = await event.eventName();
    console.log("✅ Event Name:", name);
  } catch (error: any) {
    console.error("❌ eventName() failed:", error.message);
  }

  try {
    const start = await event.startTime();
    console.log("✅ Start Time:", start.toString());
  } catch (error: any) {
    console.error("❌ startTime() failed:", error.message);
  }

  try {
    const end = await event.endTime();
    console.log("✅ End Time:", end.toString());
  } catch (error: any) {
    console.error("❌ endTime() failed:", error.message);
  }

  try {
    const cap = await event.capacity();
    console.log("✅ Capacity:", cap.toString());
  } catch (error: any) {
    console.error("❌ capacity() failed:", error.message);
  }

  try {
    const org = await event.organizer();
    console.log("✅ Organizer:", org);
  } catch (error: any) {
    console.error("❌ organizer() failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
