pragma solidity ^0.8.0;

// SPDX-License-Identifier: UNLICENSED

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract BettingNFT is ERC721, Ownable {
    struct Bet {
        address user1;
        address user2;
        uint256 amount;
        address winner;
        bool resolved;
    }

    mapping(uint256 => Bet) public bets; // Bet ID -> Bet details
    mapping(uint256 => uint256) public nftToBetId; // NFT ID -> Bet ID
    uint256 public betCount;
    uint256 public nftIdCounter;

    event BetCreated(uint256 betId, uint256 nftId, address indexed user1, address indexed user2, uint256 amount);
    event BetResolved(uint256 betId, address indexed winner);

    constructor() ERC721("BettingNFT", "BET") Ownable(msg.sender) {
        nftIdCounter = 0;
        betCount = 0;
        console.log("Contract deployed by:", msg.sender);
        console.log("Timestamp:", block.timestamp);
    }

    // Crea una scommessa associando due utenti e un importo
    function createBet(address user1, address user2, uint256 amount) public payable onlyOwner returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");

        uint256 newBetId = betCount ++;
        uint256 newNftId = nftIdCounter;

        console.log("Creating bet with ID:", newBetId);
        console.log("User1:", user1);
        console.log("User2:", user2);
        console.log("Amount:", amount);

        // Registra la scommessa
        bets[newBetId] = Bet({
            user1: user1,
            user2: user2,
            amount: amount,
            winner: address(0),
            resolved: false
        });

        nftToBetId[newNftId] = newBetId;

        console.log("Minting NFT with ID:", newNftId, "to User1:", user1);

        // Minta un NFT e assegnalo a user1 come detentore iniziale
        _safeMint(user1, newNftId);

        nftIdCounter++;
        betCount++;

        emit BetCreated(betCount, newNftId, user1, user2, amount);
        console.log("Bet created successfully with ID:", newBetId);

        return newBetId;
    }

    // Risolvi una scommessa calcolando testa o croce e verificando i bilanci
    function  resolveBet(uint256 betId) public payable onlyOwner {
        console.log("Resolving bet with ID:", betId);

        Bet storage bet = bets[betId];
        require(!bet.resolved, "Bet already resolved");
        console.log("User1:", bet.user1);
        console.log("User2:", bet.user2);
        require(bet.user1 != address(0) && bet.user2 != address(0), "Invalid users");

        console.log("Bet loaded with amount:", bet.amount);

        // Determina casualmente il vincitore
        address winnerCandidate = (block.timestamp % 2 == 0) ? bet.user1 : bet.user2;
        console.log("Winner candidate selected:", winnerCandidate);

        // Verifica i bilanci degli utenti
        if (winnerCandidate.balance >= bet.amount) {
            bet.winner = winnerCandidate;
            console.log("Winner confirmed:", winnerCandidate);
        } else if ((winnerCandidate == bet.user1 ? bet.user2 : bet.user1).balance >= bet.amount) {
            bet.winner = winnerCandidate == bet.user1 ? bet.user2 : bet.user1;
            console.log("Alternate winner selected:", bet.winner);
        } else {
            bet.winner = address(0); // Nessuno vince
            console.log("No winner due to insufficient balance");
        }

        bet.resolved = true;

        // Trasferisci l'NFT al vincitore, se c'è
        if (bet.winner != address(0)) {
            uint256 nftId = nftToBetId[betId];
            console.log("Transferring NFT with ID:", nftId, "to Winner:", bet.winner);
            _transfer(ownerOf(nftId), bet.winner, nftId);
        }

        emit BetResolved(betId, bet.winner);
        console.log("Bet resolved successfully with winner:", bet.winner);
    }
}