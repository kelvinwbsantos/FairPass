// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FairPassEvent is ERC721, Ownable {
    uint256 public ticketPrice;
    uint256 public maxSupply;
    uint256 private _totalMinted;

    event ticketMinted(
        address indexed buyer,
        address indexed eventAddress,
        uint256 tokenId
    );

    constructor(
        string memory _name,
        string memory _symbol,
        address _eventOwner,
        uint256 _ticketPrice,
        uint256 _maxSupply
    ) ERC721(_name, _symbol) Ownable(_eventOwner) {
        ticketPrice = _ticketPrice;
        maxSupply = _maxSupply;
    }

    function mintTicket() external payable {
        require(_totalMinted < maxSupply, "Out of tickets");
        require(msg.value == ticketPrice, "Not enough balance");

        uint256 tokenId = _totalMinted;
        _totalMinted++;

        _safeMint(msg.sender, tokenId);
        emit ticketMinted(msg.sender, address(this), tokenId);
    }

    function totalMinted() external view returns (uint256) {
        return _totalMinted;
    }

    function withdrawFunds() external onlyOwner {
        uint256 totalBalance = address(this).balance;
        require(totalBalance > 0, "No balance");

        (bool success, ) = payable(owner()).call{value: totalBalance}("");
        require(success, "Transfer failed");
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
