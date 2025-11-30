// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./AzendEvent.sol";

contract EventFactory {
    address public immutable implementation;
    
    address[] public deployedEvents;
    mapping(address => address[]) public organizerEvents;

    event EventCreated(address indexed eventAddress, address indexed organizer, string name);

    constructor() {
        
        implementation = address(new AzendEvent());
    }

    function createEvent(
        string memory name,
        string memory description,
        string memory location,
        string memory bannerIpfsHash,
        uint256 startTime,
        uint256 endTime,
        uint256 capacity,
        bool isFreeEvent,
        uint256 ticketPrice,
        bool requiresApproval,
        bool useEncryptedCounter
    ) public returns (address) {
      
        address clone = Clones.clone(implementation);

        AzendEvent(clone).initialize(
            msg.sender,
            name,
            description,
            location,
            bannerIpfsHash,
            startTime,
            endTime,
            capacity,
            isFreeEvent,
            ticketPrice,
            requiresApproval,
            useEncryptedCounter
        );

        deployedEvents.push(clone);
        organizerEvents[msg.sender].push(clone);

        emit EventCreated(clone, msg.sender, name);
        
        return clone;
    }

    function getEventsByOrganizer(address _organizer) public view returns (address[] memory) {
        return organizerEvents[_organizer];
    }

    function getAllEvents() public view returns (address[] memory) {
        return deployedEvents;
    }
}