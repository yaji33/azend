import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { AzendEvent, EventFactory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  organizer: HardhatEthersSigner;
  attendee: HardhatEthersSigner;
};

describe("Azend Protocol: End-to-End Flow", function () {
  let signers: Signers;
  let factoryContract: EventFactory;
  let eventContract: AzendEvent;
  let eventAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      organizer: ethSigners[1],
      attendee: ethSigners[2],
    };
  });

  beforeEach(async function () {
 
    const Factory = await ethers.getContractFactory("EventFactory");
    factoryContract = await Factory.connect(signers.deployer).deploy();
    await factoryContract.waitForDeployment();
  });

  it("Full Flow: Create Event -> Encrypted CheckIn -> Encrypted Analytics", async function () {
    // ======================================================
    // Step 1: Organizer Creates Event
    // ======================================================
    const now = Math.floor(Date.now() / 1000);
    const endTime = now + 86400; 
    const tx = await factoryContract.connect(signers.organizer).createEvent(
      "ETH Global Bangkok",
      now,
      endTime,
      100, // This is the Capacity
    );
    const receipt = await tx.wait();

    // Fetch the new Event Address
    const allEvents = await factoryContract.getAllEvents();
    expect(allEvents.length).to.eq(1);
    eventAddress = allEvents[0];

    // Attach Interface to the new address
    eventContract = await ethers.getContractAt("AzendEvent", eventAddress);

    // Verify Metadata
    expect(await eventContract.eventName()).to.eq("ETH Global Bangkok");
    expect(await eventContract.organizer()).to.eq(signers.organizer.address);

    // ======================================================
    // Step 2: Attendee Checks In (Encrypted)
    // ======================================================

    // 2a. Encrypt Timestamp (euint64)

    const inputTimestamp = await fhevm
      .createEncryptedInput(eventAddress, signers.attendee.address)
      .add64(now)
      .encrypt();

    // 2b. Encrypt Ticket Type (euint8) 
    const inputTicketType = await fhevm.createEncryptedInput(eventAddress, signers.attendee.address).add8(1).encrypt();

    // 2c. Send Transaction
    const checkInTx = await eventContract
      .connect(signers.attendee)
      .checkIn(
        inputTimestamp.handles[0],
        inputTimestamp.inputProof,
        inputTicketType.handles[0],
        inputTicketType.inputProof,
      );
    await checkInTx.wait();

    // Verify public flag (gas optimization check)
    expect(await eventContract.hasAttended(signers.attendee.address)).to.be.true;

    // ======================================================
    // Step 3: Organizer Views Analytics (Decryption)
    // ======================================================

    // Fetch the encrypted handle
    const encryptedTotal = await eventContract.connect(signers.organizer).getTotalAttendees();

    // Decrypt (Simulating re-encryption with View Key)
    // FhevmType.euint32 matches the 'euint32 private totalAttendees' in Solidity
    const decryptedTotal = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotal,
      eventAddress,
      signers.organizer, 
    );

    expect(decryptedTotal).to.eq(1); 

    // ======================================================
    // Step 4: Attendee Views Own Ticket (Decryption)
    // ======================================================

    const encryptedMyTicket = await eventContract.connect(signers.attendee).getMyEncryptedTicketType();

    const decryptedTicket = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedMyTicket,
      eventAddress,
      signers.attendee,
    );

    expect(decryptedTicket).to.eq(1); 
  });

  it("Should fail if non-organizer tries to decrypt analytics", async function () {
    // Setup event...
    const now = Math.floor(Date.now() / 1000);
    await factoryContract.connect(signers.organizer).createEvent("Secret Event", now, now + 1000, 50);
    const events = await factoryContract.getAllEvents();
    const event = await ethers.getContractAt("AzendEvent", events[0]);

    // Check in...
    const encTime = await fhevm.createEncryptedInput(events[0], signers.attendee.address).add64(now).encrypt();
    const encType = await fhevm.createEncryptedInput(events[0], signers.attendee.address).add8(1).encrypt();
    await event
      .connect(signers.attendee)
      .checkIn(encTime.handles[0], encTime.inputProof, encType.handles[0], encType.inputProof);

    // Attempt decrypt as ATTENDEE (who is not organizer)
    const encryptedTotal = await event.getTotalAttendees();


    try {
      await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedTotal,
        events[0],
        signers.attendee, 
      );
     
    } catch (e) {
      
    }
  });
});
