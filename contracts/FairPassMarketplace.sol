// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FairPassEvent.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract FairPassMarketplace is ERC721Holder {
    constructor() {}

    struct ListedTicket {
        address seller;
        uint256 price;
    }

    mapping(address => mapping(uint256 => ListedTicket)) public listings;

    /// @notice Lista ticket no marketplace
    /// @dev O contrato vira dono do nft, interage diretamente no contrato do evento
    function listTicket(address eventContract, uint256 tokenId, uint256 price) external {
        FairPassEvent eventInstance = FairPassEvent(eventContract);

        require(eventInstance.ownerOf(tokenId) == msg.sender, "Not owner");
        require(price <= eventInstance.ticketPrice());

        eventInstance.safeTransferFrom(msg.sender, address(this), tokenId);

        listings[eventContract][tokenId] = ListedTicket({
            seller: msg.sender,
            price: price
        });
    }

    /// @notice Compra ticket listado
    /// @dev Este contrato recebe o pagamento e chama o método da transacao
    function buyTicket(address eventContract, uint256 tokenId) external payable {
        ListedTicket memory ticket = listings[eventContract][tokenId];

        require(ticket.seller != address(0), "Not listed");
        require(msg.value == ticket.price, "Incorrect payment");

        transact(eventContract, tokenId, ticket.seller, msg.sender, ticket.price);

        delete listings[eventContract][tokenId];
    }

    /// @notice Fecha a compra, terminado o escrow
    /// @dev Transfere o nft para quem comprou e transfere o valor para quem vendeu. Lembrando que o nft e o valor esta neste contrato
    function transact(
        address eventContract,
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 price
    ) internal {
        FairPassEvent(eventContract).safeTransferFrom(address(this), buyer, tokenId);

        (bool success, ) = payable(seller).call{value: price}("");
        require(success, "Payment failed");
    }

    function cancelListing(address eventContract, uint256 tokenId) external {
        ListedTicket memory ticket = listings[eventContract][tokenId];

        require(ticket.seller == msg.sender, "Not seller");

        delete listings[eventContract][tokenId];

        FairPassEvent(eventContract).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId
    );
}



   
}
