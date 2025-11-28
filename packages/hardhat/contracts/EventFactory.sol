// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "./AzendEvent.sol";

contract EventFactory {
 
    AzendEvent[] public deployedEvents;

   
    mapping(address => address[]) public organizerEvents;

    event EventCreated(address indexed eventAddress, address indexed organizer, string name);

    /**
     * @notice Deploys a new privacy-preserving event contract.
     */
    function createEvent(
        string memory name,
        uint256 startTime,
        uint256 endTime,
        uint256 capacity
    ) public {
        
        AzendEvent newEvent = new AzendEvent(
            msg.sender, // Organizer
            name,
            startTime,
            endTime,
            capacity
        );

        
        deployedEvents.push(newEvent);
        organizerEvents[msg.sender].push(address(newEvent));

        emit EventCreated(address(newEvent), msg.sender, name);
    }

    /**
     * @notice Get all events created by a specific wallet
     */
    function getEventsByOrganizer(address _organizer) public view returns (address[] memory) {
        return organizerEvents[_organizer];
    }

    /**
     * @notice Get all events on the platform
     */
    function getAllEvents() public view returns (AzendEvent[] memory) {
        return deployedEvents;
    }
}