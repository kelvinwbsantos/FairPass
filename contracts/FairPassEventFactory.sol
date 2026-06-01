// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FairPassEvent.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FairPassEventFactory is Ownable, ReentrancyGuard {
    
    // ---------------------------- ERROS ----------------------------
    error NoBalance();
    error WithdrawFailed();
    error InvalidAddress();
    error InvalidEventDate();
    error InvalidMaxSupply();

    // ---------------------------- STORAGE ----------------------------

    /// @notice Lista de eventos criados por organizador
    mapping(address => address[]) public organizerEvents;

    /// @notice Lista de eventos
    address[] public allEvents;

    /// @dev Endereço do marketplace, que deve ser feito o deploy antes
    address public immutable marketplaceAddress;

    // ---------------------------- EVENTOS ----------------------------

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

    /// @notice Cria o contrato da factory
    /// @dev Para deploy precisa do endereco do marketplace
    /// @param _marketplaceAddress Endereço do marketplace
    constructor(address _marketplaceAddress) Ownable(msg.sender) {
        if (_marketplaceAddress == address(0))
            revert InvalidAddress();
            
        marketplaceAddress = _marketplaceAddress;
    }

    // ---------------------------- FUNÇÕES ----------------------------

    /// @dev Possibilita o contrato receber ether
    receive() external payable {}

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
        if (_eventTimestamp <= block.timestamp)
            revert InvalidEventDate();

        if (_maxSupply == 0)
            revert InvalidMaxSupply();

        FairPassEvent newEvent = new FairPassEvent(
            _name,
            _symbol,
            msg.sender,
            _ticketPrice,
            _maxSupply,
            _eventTimestamp,
            marketplaceAddress
        );
        organizerEvents[msg.sender].push(address(newEvent));

        allEvents.push(address(newEvent));

        emit EventCreated(
            address(newEvent),
            _ticketPrice,
            _maxSupply,
            _eventTimestamp
        );
    }

    /// @notice Permite ao owner sacar as taxas acumuladas da plataforma
    function withdrawFunds() external onlyOwner nonReentrant {
        uint256 totalBalance = address(this).balance;
        
        if (totalBalance == 0)
            revert NoBalance();

        address payable recipient = payable(owner());

        (bool successWithdraw, ) = recipient.call{value: totalBalance}(
            ""
        );
        
        if (!successWithdraw)
            revert WithdrawFailed();

        emit FundsWithdrawn(recipient, totalBalance, block.timestamp);
    }

    /// @notice Retornar todos os eventos
    function getAllEvents() external view returns (address[] memory) {
        return allEvents;
    }
}
