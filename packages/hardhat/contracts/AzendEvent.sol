// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint64, euint32, euint8, externalEuint64, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AzendEvent is ZamaEthereumConfig, Ownable {
    string public eventName;
    string public description;
    string public location;
    string public bannerIpfsHash;

    uint256 public startTime;
    uint256 public endTime;
    uint256 public capacity;
    
    bool public isFreeEvent;
    uint256 public ticketPrice;

    bool public requiresApproval;
    address public organizer;

    mapping(address => bool) public isApproved;
    mapping(address => string) public requestData;
    address[] public pendingRequests;

    euint32 private totalAttendees;

    struct EncryptedCheckIn {
        euint64 timestamp;
        euint8 ticketType;
        bool hasCheckedIn; 
    }

    mapping(address => EncryptedCheckIn) internal checkIns;

    event CheckInRecorded(address indexed attendee);
    event RequestSubmitted(address indexed applicant);
    event UserApproved(address indexed applicant);
    event FundsWithdrawn(address indexed organizer, uint256 amount);

    constructor(
        address _organizer,
        string memory _name,
        string memory _description,
        string memory _location,
        string memory _bannerIpfsHash,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _capacity,
        bool _isFreeEvent,
        uint256 _ticketPrice,
        bool _requiresApproval
    ) Ownable(_organizer) { 
        organizer = _organizer;
        eventName = _name;
        description = _description;
        location = _location;
        bannerIpfsHash = _bannerIpfsHash;
        startTime = _startTime;
        endTime = _endTime;
        capacity = _capacity;
        isFreeEvent = _isFreeEvent;
        ticketPrice = _ticketPrice;
        requiresApproval = _requiresApproval;

        totalAttendees = FHE.asEuint32(0);
        
        FHE.allowThis(totalAttendees);
        FHE.allow(totalAttendees, organizer);
    }

    function requestToJoin(string memory metadata) public {
        require(requiresApproval, "Event is open to all");
        require(bytes(requestData[msg.sender]).length == 0, "Already requested");
        
        requestData[msg.sender] = metadata;
        pendingRequests.push(msg.sender);
        
        emit RequestSubmitted(msg.sender);
    }

    function approveUser(address user) public onlyOwner {
        isApproved[user] = true;
        emit UserApproved(user);
    }

    function getPendingRequests() public view returns (address[] memory) {
        return pendingRequests;
    }

    function checkIn(
        externalEuint64 inputTimestamp,
        bytes calldata timestampProof,
        externalEuint8 inputTicketType,
        bytes calldata ticketTypeProof
    ) public payable { 
        require(block.timestamp <= endTime, "Event has ended");
        require(!checkIns[msg.sender].hasCheckedIn, "Already checked in");

        if (!isFreeEvent) {
            require(msg.value >= ticketPrice, "Insufficient payment");
        }

        if (requiresApproval) {
            require(isApproved[msg.sender] || msg.sender == organizer, "Not approved by host");
        }

        euint64 timestamp = FHE.fromExternal(inputTimestamp, timestampProof);
        euint8 ticketType = FHE.fromExternal(inputTicketType, ticketTypeProof);

        checkIns[msg.sender].timestamp = timestamp;
        checkIns[msg.sender].ticketType = ticketType;
        checkIns[msg.sender].hasCheckedIn = true;

        FHE.allowThis(timestamp);
        FHE.allow(timestamp, msg.sender);
        
        FHE.allowThis(ticketType);
        FHE.allow(ticketType, msg.sender);

        totalAttendees = FHE.add(totalAttendees, FHE.asEuint32(1));
        
        FHE.allowThis(totalAttendees);
        FHE.allow(totalAttendees, organizer);

        emit CheckInRecorded(msg.sender);
    }

    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");
        
        (bool sent, ) = payable(organizer).call{value: balance}("");
        require(sent, "Failed to withdraw");
        
        emit FundsWithdrawn(organizer, balance);
    }

    function getTotalAttendees() public view returns (euint32) {
        return totalAttendees;
    }

    function getMyEncryptedTicketType() public view returns (euint8) {
        require(checkIns[msg.sender].hasCheckedIn, "No record found");
        return checkIns[msg.sender].ticketType;
    }
    
    function hasAttended(address user) public view returns (bool) {
        return checkIns[user].hasCheckedIn;
    }

    function getEventDetails() public view returns (
        string memory name,
        string memory desc,
        string memory loc,
        string memory banner,
        uint256 start,
        uint256 end,
        uint256 cap,
        bool isFree,
        uint256 price,
        bool needsApproval
    ) {
        return (
            eventName,
            description,
            location,
            bannerIpfsHash,
            startTime,
            endTime,
            capacity,
            isFreeEvent,
            ticketPrice,
            requiresApproval
        );
    }
}