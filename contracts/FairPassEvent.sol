// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FairPassEvent is ERC721, Ownable, ReentrancyGuard {
    // ---------------------------- ERROS ----------------------------
    error NoTicket();
    error TicketTransferFailed();
    error RefundFailed();
    error EventNotCanceled();
    error NotOwner();
    error EventIsNotActive();
    error EventTimestampWrong();
    error WithdrawFailed();
    error FeesPayFailed();
    error OutOfTickets();
    error WrongValuePayment();
    error MaxTicketsNumber();
    error EventNotCompleted();

    // ---------------------------- STORAGE ----------------------------
    enum EventStatus {
        Active,
        Completed,
        Canceled
    }

    /// @notice Status do evento
    /// @dev Para simular a maquina de estado
    EventStatus public status;

    /// @notice Mapeamento para rastrear o tokenId do ingresso possuído por cada usuário
    mapping(address => uint256) public ownedToken;

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

    address private immutable marketplaceAddress;

    // ---------------------------- Eventos ----------------------------

    /// @notice Emitido quando um novo ingresso é mintado
    /// @param buyer Endereço do comprador
    /// @param eventAddress Endereço do contrato do evento
    /// @param tokenId ID do ingresso NFT
    event TicketMinted(
        address indexed buyer,
        address indexed eventAddress,
        uint256 tokenId
    );

    event EventConcluded(uint256 indexed conclusionTimestamp);

    /// @notice Emitido quando os fundos do evento são sacados
    /// @param organizer Organizador do evento
    /// @param payout Valor recebido pelo organizador
    /// @param fee Taxa enviada para a plataforma
    event EventRevenueWithdrawn(
        address indexed organizer,
        uint256 payout,
        uint256 fee
    );

    // ---------------------------- Funcoes ----------------------------

    event EventCanceled(uint256 timestamp);
    event TicketRefunded(address indexed buyer, uint256 amountRefunded);

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
        uint256 _eventTimestamp,
        address _marketplaceAddress
    ) ERC721(_name, _symbol) Ownable(_eventOwner) {
        ticketPrice = _ticketPrice;
        maxSupply = _maxSupply;
        eventTimestamp = _eventTimestamp;
        factory = msg.sender;
        status = EventStatus.Active;
        marketplaceAddress = _marketplaceAddress;
    }

    /// @notice Compra um ingresso NFT do evento
    /// @dev O mint é bloqueado após o encerramento do evento
    function mintTicket() external payable {
        if (status != EventStatus.Active) revert EventIsNotActive();

        if (block.timestamp > eventTimestamp) revert EventTimestampWrong();

        if (_totalMinted >= maxSupply) revert OutOfTickets();
        if (msg.value != ticketPrice) revert WrongValuePayment();
        if (balanceOf(msg.sender) >= 1) revert MaxTicketsNumber();

        _totalMinted++;
        uint256 tokenId = _totalMinted;

        _safeMint(msg.sender, tokenId);

        ownedToken[msg.sender] = tokenId;

        emit TicketMinted(msg.sender, address(this), tokenId);
    }

    /// @notice Retorna a quantidade total de ingressos emitidos
    function totalMinted() external view returns (uint256) {
        return _totalMinted;
    }

    /// @notice Permite ao organizador sacar os fundos do evento
    /// @dev Uma taxa de 1% é enviada automaticamente para a factory
    function withdrawFunds() external onlyOwner nonReentrant {
        if (status != EventStatus.Completed) revert EventNotCompleted();

        if (block.timestamp <= eventTimestamp) revert EventTimestampWrong();

        uint256 totalBalance = address(this).balance;
        require(totalBalance > 0, "No balance");

        uint256 feeBps = 100;
        uint256 fee = (totalBalance * feeBps) / 10_000;

        (bool success, ) = payable(factory).call{value: fee}("");
        if (!success) revert FeesPayFailed();

        uint256 ownerAmount = totalBalance - fee;

        (bool successWithdraw, ) = payable(owner()).call{value: ownerAmount}(
            ""
        );
        if (!successWithdraw) revert WithdrawFailed();

        emit EventRevenueWithdrawn(owner(), ownerAmount, fee);
    }

    /// @notice Concluir evento
    function concludeEvent() external onlyOwner {
        if (status != EventStatus.Active) revert EventIsNotActive();

        if (block.timestamp <= eventTimestamp) revert EventTimestampWrong();

        status = EventStatus.Completed;
        emit EventConcluded(block.timestamp);
    }

    /// @notice Cancelar evento
    function cancelEvent() external onlyOwner {
        if (status != EventStatus.Active) revert EventIsNotActive();

        status = EventStatus.Canceled;

        emit EventCanceled(block.timestamp);
    }

    /// @notice Reembolsar ticket
    /// @dev Reembolsa para o atual dono do ticket
    function refundTicket(uint256 tokenId) external nonReentrant {
        if (status != EventStatus.Canceled) revert EventNotCanceled();

        if (ownerOf(tokenId) != msg.sender) revert NotOwner();

        address payable recipient = payable(msg.sender);

        _burn(tokenId);

        (bool success, ) = recipient.call{value: ticketPrice}("");
        if (!success) revert RefundFailed();

        emit TicketRefunded(msg.sender, ticketPrice);
    }

    /// @dev override para bloquear transferencias p2p (permite mint, burn, e transferencia pelo marketplace)
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = super._update(to, tokenId, auth);

        if (from != address(0) && to != address(0)) {
            if (msg.sender != marketplaceAddress) revert TicketTransferFailed();
        }

        if (to != address(0) && to != marketplaceAddress) {
            ownedToken[to] = tokenId;
        }

        if (from != address(0) && from != marketplaceAddress) {
            ownedToken[from] = 0;
        }

        return from;
    }

    /// @notice Retorna o saldo atual armazenado no contrato
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Retorna o tokenId do ingresso possuído por um usuário
    function getUserTicketId(address user) external view returns (uint256) {
        uint256 balance = balanceOf(user);

        if (balance == 0) revert NoTicket();

        return ownedToken[user];
    }
}
