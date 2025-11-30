import { ethers } from "hardhat";

async function main() {
  const factoryAddress = "0x36fe65BBC38c4692C9C6138d6a103d1BfE93942a";

  console.log("Creating event via factory at:", factoryAddress);
  console.log("=".repeat(50));

  const factory = await ethers.getContractAt("EventFactory", factoryAddress);
  const [signer] = await ethers.getSigners();

  console.log("Organizer address:", signer.address);
  console.log("\n📝 Event Parameters:\n");

  // Event parameters
  const eventParams = {
    name: "Test Event",
    description: "A test event for demonstration",
    location: "Virtual",
    bannerIpfsHash: "QmTest123",
    startTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    endTime: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
    capacity: 100,
    isFreeEvent: true,
    ticketPrice: 0,
    requiresApproval: false,
    useEncryptedCounter: false,
  };

  console.log("Name:", eventParams.name);
  console.log("Description:", eventParams.description);
  console.log("Location:", eventParams.location);
  console.log("Start:", new Date(eventParams.startTime * 1000).toISOString());
  console.log("End:", new Date(eventParams.endTime * 1000).toISOString());
  console.log("Capacity:", eventParams.capacity);
  console.log("Free Event:", eventParams.isFreeEvent);
  console.log("Requires Approval:", eventParams.requiresApproval);
  console.log("Use Encrypted Counter:", eventParams.useEncryptedCounter);

  console.log("\n🚀 Creating event...\n");

  try {
    const tx = await factory.createEvent(
      eventParams.name,
      eventParams.description,
      eventParams.location,
      eventParams.bannerIpfsHash,
      eventParams.startTime,
      eventParams.endTime,
      eventParams.capacity,
      eventParams.isFreeEvent,
      eventParams.ticketPrice,
      eventParams.requiresApproval,
      eventParams.useEncryptedCounter,
    );

    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Gas used:", receipt?.gasUsed.toString());

    // Find the EventCreated event in the logs
    const eventCreatedLog = receipt?.logs.find((log: any) => {
      try {
        const parsed = factory.interface.parseLog(log);
        return parsed?.name === "EventCreated";
      } catch {
        return false;
      }
    });

    if (eventCreatedLog) {
      const parsed = factory.interface.parseLog(eventCreatedLog);
      const eventAddress = parsed?.args[0];
      const organizer = parsed?.args[1];
      const name = parsed?.args[2];

      console.log("\n🎉 Event Created Successfully!\n");
      console.log("📍 Event Address:", eventAddress);
      console.log("👤 Organizer:", organizer);
      console.log("📛 Name:", name);
      console.log("\n" + "=".repeat(50));
      console.log("Use this address in your test script:");
      console.log(eventAddress);
      console.log("=".repeat(50));
    } else {
      console.log("\n⚠️  Event created but couldn't parse address from logs");
      console.log("Check the transaction on block explorer");
    }

    // Also get all events from factory
    console.log("\n📋 All events from this organizer:");
    const organizerEvents = await factory.getEventsByOrganizer(signer.address);
    organizerEvents.forEach((addr: string, i: number) => {
      console.log(`  ${i + 1}. ${addr}`);
    });
  } catch (error: any) {
    console.error("\n❌ Error creating event:");
    console.error(error.message);
    if (error.reason) console.error("Reason:", error.reason);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
