// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FairPassEvent.sol";

contract FairPassEventFactory {
    mapping(address => FairPassEvent[]) public eventos;

    event eventCreated(
        address indexed eventContractAddress,
        uint256 ticketPrice,
        uint256 maxSupply
    );

    function createEvent(
        string memory _name,
        string memory _symbol,
        uint256 _ticketPrice,
        uint256 _maxSupply
    ) public {
        FairPassEvent newEvent = new FairPassEvent(
            _name,
            _symbol,
            msg.sender,
            _ticketPrice,
            _maxSupply
        );
        eventos[msg.sender].push(newEvent);

        emit eventCreated(address(newEvent), _ticketPrice, _maxSupply);
    }
}
