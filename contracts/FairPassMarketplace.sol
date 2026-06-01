// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IFairPassEvent {
    function ownerOf(uint256 tokenId) external view returns (address);

    function balanceOf(address owner) external view returns (uint256);

    function ticketPrice() external view returns (uint256);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;
}

contract FairPassMarketplace is ERC721Holder, ReentrancyGuard {
    constructor() {}

    // ---------------------------- Erros ----------------------------
    error NotTicketOwner();
    error ListPriceTooHigh();
    error WrongPaymentValue();
    error PaymentFailed();
    error TicketNotListed();

    // ---------------------------- STORAGE ----------------------------

    struct ListedTicket {
        address eventContract;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isListed;
    }

    /// @dev Todos os tickets listados
    ListedTicket[] public allListings;

    /// @dev Tickets listados e separados pelo contrato do evento
    mapping(address => mapping(uint256 => uint256)) public listingIndex; // eventContract => tokenId => index in allListings

    // ---------------------------- Eventos ----------------------------
    
    event TicketListed(address indexed eventContract, uint256 indexed tokenId, address indexed seller, uint256 price);
    event TicketDelisted(address indexed eventContract, uint256 indexed tokenId, address indexed seller);
    event TicketTransacted(address indexed eventContract, uint256 indexed tokenId, address indexed seller, address buyer, uint256 price);
    // ---------------------------- Funcoes ----------------------------

    /// @notice Lista ticket no marketplace
    /// @dev O contrato vira dono do nft, interage diretamente no contrato do evento
    function listTicket(
        address eventContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        IFairPassEvent eventInstance = IFairPassEvent(eventContract);

        if (eventInstance.ownerOf(tokenId) != msg.sender)
            revert NotTicketOwner();

        if (price > eventInstance.ticketPrice()) revert ListPriceTooHigh();

        eventInstance.safeTransferFrom(msg.sender, address(this), tokenId);

        allListings.push(
            ListedTicket({
                eventContract: eventContract,
                tokenId: tokenId,
                seller: msg.sender,
                price: price,
                isListed: true
            })
        );

        listingIndex[eventContract][tokenId] = allListings.length - 1;

        emit TicketListed(eventContract, tokenId, msg.sender, price);
    }

    /// @notice Compra ticket listado
    /// @dev Este contrato recebe o pagamento e chama o método da transacao
    function buyTicket(
        address eventContract,
        uint256 tokenId
    ) external payable nonReentrant {
        uint256 index = listingIndex[eventContract][tokenId];

        if (index >= allListings.length || !allListings[index].isListed) {
            revert TicketNotListed();
        }

        ListedTicket memory ticket = allListings[index];

        if (msg.value != ticket.price) revert WrongPaymentValue();

        transact(
            eventContract,
            tokenId,
            ticket.seller,
            msg.sender,
            ticket.price
        );

        _removeListing(eventContract, tokenId);
        emit TicketTransacted(eventContract, tokenId, ticket.seller, msg.sender, ticket.price);
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
        IFairPassEvent(eventContract).safeTransferFrom(
            address(this),
            buyer,
            tokenId
        );

        (bool success, ) = payable(seller).call{value: price}("");
        if (!success) revert PaymentFailed();
    }

    /// @notice Cancelar listagem
    function cancelListing(
        address eventContract,
        uint256 tokenId
    ) external nonReentrant {
        uint256 index = listingIndex[eventContract][tokenId];
        ListedTicket memory ticket = allListings[index];

        if (ticket.seller != msg.sender) revert NotTicketOwner();

        IFairPassEvent(eventContract).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId
        );

        _removeListing(eventContract, tokenId);
        emit TicketDelisted(eventContract, tokenId, msg.sender);
    }

    /// @notice Remove ticket listado
    function _removeListing(address eventContract, uint256 tokenId) internal {
        uint256 indexToRemove = listingIndex[eventContract][tokenId];
        uint256 lastIndex = allListings.length - 1;

        if (indexToRemove != lastIndex) {
            ListedTicket memory lastListing = allListings[lastIndex];
            allListings[indexToRemove] = lastListing;
            listingIndex[lastListing.eventContract][
                lastListing.tokenId
            ] = indexToRemove;
        }

        allListings.pop();

        delete listingIndex[eventContract][tokenId];
    }

    /// @notice Retorna todos os tickets listados
    function getAllListings() external view returns (ListedTicket[] memory) {
        return allListings;
    }
}
