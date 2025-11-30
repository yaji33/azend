// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint64, euint32, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AzendEvent is ZamaEthereumConfig, Ownable {
    bool private initialized;
    
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

    mapping(address => string) public requestData;
    mapping(address => bool) public hasRequested;

    struct CheckInRecord {
        euint64 packed; 
        bool hasCheckedIn;
    }
    mapping(address => CheckInRecord) internal checkIns;

    bool public useEncryptedCounter;
    euint32 private totalAttendeesEncrypted;
    uint32 public totalAttendeesPlain;

    event CheckInRecorded(address indexed attendee);
    event RequestSubmitted(address indexed applicant, string metadata);
    event UserApproved(address indexed applicant);
    event FundsWithdrawn(address indexed organizer, uint256 amount);
    event EventCreated(address indexed contractAddress, address indexed organizer, string name);

   
    constructor() Ownable(msg.sender) {}


    function initialize(
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
        bool _requiresApproval,
        bool _useEncryptedCounter 
    ) external {
        require(!initialized, "Already initialized");
        initialized = true;

        _transferOwnership(_organizer);
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

        useEncryptedCounter = _useEncryptedCounter;

        if (useEncryptedCounter) {
            totalAttendeesEncrypted = FHE.asEuint32(0);
            FHE.allowThis(totalAttendeesEncrypted);
            FHE.allow(totalAttendeesEncrypted, organizer);
        } else {
            totalAttendeesPlain = 0;
        }
    }

    function requestToJoin(string memory metadata) public {
        require(requiresApproval, "Event is open to all");
        require(!hasRequested[msg.sender], "Already requested");

        requestData[msg.sender] = metadata;
        hasRequested[msg.sender] = true;
        emit RequestSubmitted(msg.sender, metadata);
    }

    function approveUser(address user) public onlyOwner {
        require(!isApproved(user), "Already approved");
        _setApproved(user);
    }

    mapping(address => bool) internal approvals;
    function _setApproved(address user) internal {
        approvals[user] = true;
        emit UserApproved(user);
    }
    
    function isApproved(address user) public view returns (bool) {
        return approvals[user];
    }

    function checkIn(
        externalEuint64 inputPacked,
        bytes calldata packedProof
    ) public payable {
        require(block.timestamp <= endTime, "Event ended");
        require(!checkIns[msg.sender].hasCheckedIn, "Already checked in");
        if (!isFreeEvent) {
            require(msg.value >= ticketPrice, "Insufficient payment");
        }
        if (requiresApproval) {
            require(isApproved(msg.sender) || msg.sender == organizer, "Not approved");
        }

        euint64 packed = FHE.fromExternal(inputPacked, packedProof);

        checkIns[msg.sender].packed = packed;
        checkIns[msg.sender].hasCheckedIn = true;

        if (useEncryptedCounter) {
            totalAttendeesEncrypted = FHE.add(totalAttendeesEncrypted, FHE.asEuint32(1));
            FHE.allowThis(totalAttendeesEncrypted);
            FHE.allow(totalAttendeesEncrypted, organizer);
        } else {
            unchecked { totalAttendeesPlain = totalAttendeesPlain + 1; }
        }

        emit CheckInRecorded(msg.sender);
    }

    function hasAttended(address user) public view returns (bool) {
        return checkIns[user].hasCheckedIn;
    }

    function getMyPackedCheckIn() public view returns (euint64) {
        require(checkIns[msg.sender].hasCheckedIn, "No record");
        return checkIns[msg.sender].packed;
    }
    
    function getTotalAttendeesEncrypted() public view returns (euint32) {
        require(useEncryptedCounter, "Encrypted counter disabled");
        return totalAttendeesEncrypted;
    }
    
    function getTotalAttendeesPlain() public view returns (uint32) {
        require(!useEncryptedCounter, "Plain counter disabled");
        return totalAttendeesPlain;
    }
    
    function withdrawFunds() public onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "No funds");
        (bool ok, ) = payable(organizer).call{value: bal}("");
        require(ok, "Transfer failed");
        emit FundsWithdrawn(organizer, bal);
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
            eventName, description, location, bannerIpfsHash,
            startTime, endTime, capacity,
            isFreeEvent, ticketPrice, requiresApproval
        );
    }
}