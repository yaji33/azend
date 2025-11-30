// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "./AzendEvent.sol";

contract EventFactory {
    AzendEvent[] public deployedEvents;
    mapping(address => address[]) public organizerEvents;

    event EventCreated(address indexed eventAddress, address indexed organizer, string name);

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
        bool requiresApproval
    ) public {
        AzendEvent newEvent = new AzendEvent(
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
            requiresApproval
        );

        deployedEvents.push(newEvent);
        organizerEvents[msg.sender].push(address(newEvent));

        emit EventCreated(address(newEvent), msg.sender, name);
    }

    function getEventsByOrganizer(address _organizer) public view returns (address[] memory) {
        return organizerEvents[_organizer];
    }

    function getAllEvents() public view returns (AzendEvent[] memory) {
        return deployedEvents;
    }
}