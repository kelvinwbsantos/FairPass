// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FairPassEvent.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FairPassEventFactory is Ownable {
    /// @notice Lista de eventos criados por organizador
    mapping(address => FairPassEvent[]) public organizerEvents;

    /// @dev Endereço do marketplace, que deve ser feito o deploy antes
    address private marketplaceAddress;

    /// @notice Emitido quando um novo contrato de evento é criado
    /// @param eventContractAddress Endereço do contrato do evento
    /// @param ticketPrice Preço do ingresso
    /// @param maxSupply Quantidade máxima de ingressos
    /// @param eventTimestamp Timestamp de início do evento
    event EventCreated(
        address indexed eventContractAddress,
        uint256 ticketPrice,
        uint256 maxSupply,
        uint256 eventTimestamp
    );

    /// @notice Emitido quando os fundos da plataforma são sacados
    /// @param _address Endereço que recebeu os fundos
    /// @param payout Valor sacado
    /// @param timestamp Momento do saque
    event FundsWithdrawn(
        address indexed _address,
        uint256 payout,
        uint256 timestamp
    );

    constructor(
        address _marketplaceAddress
    ) Ownable(msg.sender) {
        marketplaceAddress = _marketplaceAddress;
    }

    /// @notice Cria um novo contrato de evento
    /// @param _name Nome do NFT do evento
    /// @param _symbol Símbolo do NFT
    /// @param _ticketPrice Preço do ingresso em wei
    /// @param _maxSupply Quantidade máxima de ingressos
    /// @param _eventTimestamp Timestamp de início do evento
    function createEvent(
        string memory _name,
        string memory _symbol,
        uint256 _ticketPrice,
        uint256 _maxSupply,
        uint256 _eventTimestamp
    ) external {
        FairPassEvent newEvent = new FairPassEvent(
            _name,
            _symbol,
            msg.sender,
            _ticketPrice,
            _maxSupply,
            _eventTimestamp,
            marketplaceAddress
        );
        organizerEvents[msg.sender].push(newEvent);

        emit EventCreated(
            address(newEvent),
            _ticketPrice,
            _maxSupply,
            _eventTimestamp
        );
    }

    /// @notice Permite ao owner sacar as taxas acumuladas da plataforma
    function withdrawFunds() external onlyOwner {
        uint256 totalBalance = address(this).balance;
        require(totalBalance > 0, "No balance");

        (bool successWithdraw, ) = payable(owner()).call{value: totalBalance}(
            ""
        );
        require(successWithdraw, "Transfer failed");

        emit FundsWithdrawn(owner(), totalBalance, block.timestamp);
    }
}
