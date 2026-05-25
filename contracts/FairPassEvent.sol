// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FairPassEvent is ERC721, Ownable {

    enum EventStatus {
        Active,
        Completed,
        Canceled
    }

    /// @notice Status do evento
    /// @dev Para simular a maquina de estado
    EventStatus public status;

    /// @notice Endereço da factory responsável pela criação do evento
    /// @dev Utilizado para recebimento das taxas da plataforma
    address private immutable factory;

    /// @notice Preço do ingresso em wei
    uint256 public ticketPrice;

    /// @notice Quantidade máxima de ingressos disponíveis
    uint256 public maxSupply;

    /// @notice Quantidade total de ingressos emitidos
    uint256 private _totalMinted;

    /// @notice Timestamp de início do evento
    uint256 public immutable eventTimestamp;

    /// @notice Emitido quando um novo ingresso é mintado
    /// @param buyer Endereço do comprador
    /// @param eventAddress Endereço do contrato do evento
    /// @param tokenId ID do ingresso NFT
    /// @param used Booleano de uso do ticket
    event TicketMinted(
        address indexed buyer,
        address indexed eventAddress,
        uint256 tokenId,
        bool used
    );

    event EventConcluded (
        uint256 indexed conclusionTimestamp
    );

    /// @notice Emitido quando os fundos do evento são sacados
    /// @param organizer Organizador do evento
    /// @param payout Valor recebido pelo organizador
    /// @param fee Taxa enviada para a plataforma
    event EventRevenueWithdrawn(
        address indexed organizer,
        uint256 payout,
        uint256 fee
    );

    /// @notice Inicializa um novo contrato de evento
    /// @param _name Nome do NFT
    /// @param _symbol Símbolo do NFT
    /// @param _eventOwner Organizador do evento
    /// @param _ticketPrice Preço do ingresso em wei
    /// @param _maxSupply Quantidade máxima de ingressos
    /// @param _eventTimestamp Timestamp de início do evento
    constructor(
        string memory _name,
        string memory _symbol,
        address _eventOwner,
        uint256 _ticketPrice,
        uint256 _maxSupply,
        uint256 _eventTimestamp
    ) ERC721(_name, _symbol) Ownable(_eventOwner) {
        ticketPrice = _ticketPrice;
        maxSupply = _maxSupply;
        eventTimestamp = _eventTimestamp;
        factory = msg.sender;
        status = EventStatus.Active;
    }

    /// @notice Compra um ingresso NFT do evento
    /// @dev O mint é bloqueado após o encerramento do evento
    function mintTicket() external payable {
        require(status == EventStatus.Active, "Event is not active for tickets");
        require(block.timestamp < eventTimestamp, "Event already ended");

        require(_totalMinted < maxSupply, "Out of tickets");
        require(msg.value == ticketPrice, "Not enough balance");

        uint256 tokenId = _totalMinted;
        _totalMinted++;

        _safeMint(msg.sender, tokenId);
        emit TicketMinted(msg.sender, address(this), tokenId, false);
    }

    /// @notice Retorna a quantidade total de ingressos emitidos
    function totalMinted() external view returns (uint256) {
        return _totalMinted;
    }

    /// @notice Permite ao organizador sacar os fundos do evento
    /// @dev Uma taxa de 1% é enviada automaticamente para a factory
    function withdrawFunds() external onlyOwner {
        require(status == EventStatus.Completed, "Event has not ended yet");
        require(block.timestamp > eventTimestamp, "Cannot withdraw until event is ended");

        uint256 totalBalance = address(this).balance;
        require(totalBalance > 0, "No balance");

        uint256 feeBps = 100;
        uint256 fee = (totalBalance * feeBps) / 10_000;

        (bool success, ) = payable(factory).call{value: fee}("");
        require(success, "Transfer failed");

        uint256 ownerAmount = totalBalance - fee;

        (bool successWithdraw, ) = payable(owner()).call{value: ownerAmount}("");
        require(successWithdraw, "Transfer failed");

        emit EventRevenueWithdrawn(owner(), ownerAmount, fee);
    }

    function concludeEvent() external onlyOwner {
        require(status == EventStatus.Active, "Event cannot end without starting");
        require(block.timestamp > eventTimestamp, "Cannot end until last day");

        status = EventStatus.Completed;
        emit EventConcluded(block.timestamp);
    }

    // cancel event function, needs to refund

    /// @notice Retorna o saldo atual armazenado no contrato
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
