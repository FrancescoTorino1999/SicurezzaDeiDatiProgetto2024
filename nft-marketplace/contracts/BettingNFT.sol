// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract BettingNFT is ERC721, Ownable {
    struct Bet {
        address testa; // Utente che ha scelto "Testa"
        address croce; // Utente che ha scelto "Croce"
        uint256 amount; // Importo della scommessa
        bool completed; // Stato della scommessa
        address winner;
    }

    mapping(string => Bet) public bets; // certificateId -> Bet
    mapping(string => uint256) public nftToCertificateId; // certificateId -> NFT ID
    uint256 public nftIdCounter;

    event BetCompleted(string certificateId, address winner);

    constructor(string memory name, string memory symbol, address initialOwner)
        ERC721(name, symbol)
        Ownable(initialOwner)
    {}

    // Funzione per piazzare una scommessa o unirsi a una scommessa esistente
    function joinBet(string memory certificateId, string memory choice) public payable {
        require(msg.value > 0, "Bet amount must be greater than zero");
        require(keccak256(abi.encodePacked(choice)) == keccak256(abi.encodePacked("Testa")) ||
                keccak256(abi.encodePacked(choice)) == keccak256(abi.encodePacked("Croce")),
                "Choice must be 'Testa' or 'Croce'");

        Bet storage bet = bets[certificateId];

        // Utente che piazza la scommessa come "Testa"
        if (keccak256(abi.encodePacked(choice)) == keccak256(abi.encodePacked("Testa"))) {
            require(bet.testa == address(0), "Testa already chosen");
            bet.testa = msg.sender;
            bet.amount = msg.value;
        } 
        // Utente che si unisce come "Croce"
        if (keccak256(abi.encodePacked(choice)) == keccak256(abi.encodePacked("Croce"))) {
            require(bet.croce == address(0), "Croce already chosen");
            bet.croce = msg.sender;
            bet.amount = msg.value;           
        }

        if(bet.testa != address(0) && bet.croce != address(0)) {

            bet.winner = _completeBet(certificateId);
            emit BetCompleted(certificateId, bet.winner);

        }
    }

    // Funzione privata per completare una scommessa
    function _completeBet(string memory certificateId) internal returns(address){
        Bet storage bet = bets[certificateId];
        console.log("Completing bet for certificateId:", certificateId);

        require(bet.testa != address(0) && bet.croce != address(0), "Both sides must be filled");
        console.log("Both sides filled: testa =", bet.testa, ", croce =", bet.croce);

        require(!bet.completed, "Bet already completed");
        console.log("Bet not yet completed, proceeding...");

        // Determina il vincitore
        address winner = _determineWinner(bet.testa, bet.croce);
        console.log("Winner determined:", winner);
        bet.winner = winner;
        bet.completed = true;

        // Trasferisci i fondi all'owner
        uint256 totalAmount = bet.amount * 2;
        console.log("Transferring funds to owner. Total amount:", totalAmount);

        (bool sent, ) = owner().call{value: totalAmount}("");
        require(sent, "Transfer to owner failed");
        console.log("Funds transferred to owner successfully.");

        // Trasferisci l'NFT al vincitore
        uint256 nftId = nftIdCounter;
        console.log("Minting NFT with ID:", nftId);

        nftToCertificateId[certificateId] = nftId;
        _safeMint(owner(), nftId);
        console.log("NFT minted to owner. Transferring to winner:", winner);

        _transfer(owner(), winner, nftId);
        nftIdCounter++;

        console.log("NFT transferred to winner:", winner);

        return winner;
    }

    // Funzione privata per determinare il vincitore
    function _determineWinner(address testa, address croce) private view returns (address) {
        return (block.timestamp % 2 == 0) ? testa : croce;
    }

    // Funzione pubblica per ottenere il vincitore di una scommessa
    function getWinner(string memory certificateId) public view returns (address) {
        Bet storage bet = bets[certificateId];
        return bet.winner;
    }
}