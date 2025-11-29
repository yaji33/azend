// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint64, euint32, euint8, externalEuint64, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AzendEvent is ZamaEthereumConfig, Ownable {
    // Event Metadata 
    string public eventName;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public capacity;
    
    // The organizer's address 
    address public organizer;

    // Encrypted Analytics 
    euint32 private totalAttendees;

    struct EncryptedCheckIn {
        euint64 timestamp;
        euint8 ticketType;
        bool hasCheckedIn; 
    }

    mapping(address => EncryptedCheckIn) internal checkIns;

    event CheckInRecorded(address indexed attendee);

    constructor(
        address _organizer,
        string memory _name,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _capacity
    ) Ownable(_organizer) { 
        organizer = _organizer;
        eventName = _name;
        startTime = _startTime;
        endTime = _endTime;
        capacity = _capacity;
        
      
        totalAttendees = FHE.asEuint32(0);
        
      
        FHE.allowThis(totalAttendees);
        FHE.allow(totalAttendees, organizer);
    }

    /**
     * @notice Performs an encrypted check-in.
     * @param inputTimestamp Encrypted timestamp from the client SDK
     * @param timestampProof Proof for the timestamp
     * @param inputTicketType Encrypted ticket type (0 or 1)
     * @param ticketTypeProof Proof for the ticket type
     */
    function checkIn(
        externalEuint64 inputTimestamp,
        bytes calldata timestampProof,
        externalEuint8 inputTicketType,
        bytes calldata ticketTypeProof
    ) public {
        require(block.timestamp <= endTime, "Event has ended");
        require(!checkIns[msg.sender].hasCheckedIn, "Already checked in");

      
        euint64 timestamp = FHE.fromExternal(inputTimestamp, timestampProof);
        euint8 ticketType = FHE.fromExternal(inputTicketType, ticketTypeProof);

        
        checkIns[msg.sender].timestamp = timestamp;
        checkIns[msg.sender].ticketType = ticketType;
        checkIns[msg.sender].hasCheckedIn = true;

        // Allow User to see their own data
        FHE.allowThis(timestamp);
        FHE.allow(timestamp, msg.sender);
        
        FHE.allowThis(ticketType);
        FHE.allow(ticketType, msg.sender);

     
        totalAttendees = FHE.add(totalAttendees, FHE.asEuint32(1));
        
        // Allow Organizer to see new total
        FHE.allowThis(totalAttendees);
        FHE.allow(totalAttendees, organizer);

        emit CheckInRecorded(msg.sender);
    }

    /**
     * @notice Returns the encrypted total count.
     * Only the organizer possesses the View Key to decrypt this result.
     */
    function getTotalAttendees() public view returns (euint32) {
        return totalAttendees;
    }

    /**
     * @notice Returns the user's encrypted ticket type.
     */
    function getMyEncryptedTicketType() public view returns (euint8) {
        require(checkIns[msg.sender].hasCheckedIn, "No record found");
        return checkIns[msg.sender].ticketType;
    }
    
    /**
     * @notice Helper to check attendance status publicly 
     */
    function hasAttended(address user) public view returns (bool) {
        return checkIns[user].hasCheckedIn;
    }
}