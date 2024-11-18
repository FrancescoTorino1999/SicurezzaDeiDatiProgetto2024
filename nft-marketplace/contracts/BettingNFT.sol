// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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

    constructor(string memory name, string memory symbol, address initialOwner) 
    ERC721(name, symbol) 
    Ownable(initialOwner) // Passa l'owner iniziale
    {
        require(initialOwner != address(0), "Invalid owner address");
    }

    event BetCreated(uint256 betId, address user1, address user2, uint256 amount);


    // Crea una scommessa associando due utenti e un importo
    function createBet(address user1, address user2, uint256 amount) public payable returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(user1 != address(0) && user2 != address(0), "Invalid user addresses");

        uint256 newBetId = betCount;
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

        // Minta un NFT inizialmente associato a User1
        _safeMint(owner(), newNftId);

        nftIdCounter++;
        betCount++;

        emit BetCreated(newBetId, user1, user2, amount); // L'evento deve essere emesso
        return newBetId;
    }

    function resolveBet(uint256 betId) public {
        console.log("Resolving bet with ID:", betId);

        Bet storage bet = bets[betId];
        require(!bet.resolved, "Bet already resolved");
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

        // Se c'è un vincitore, trasferisci l'importo all'owner e assegna l'NFT
        if (bet.winner != address(0)) {
            uint256 nftId = nftToBetId[betId];
            console.log("Transferring NFT with ID:", nftId, "to Winner:", bet.winner);

            // Trasferisci l'importo all'owner del contratto
            
            (bool sent, ) = bet.winner.call{value: bet.amount}("");
            require(sent, "Transfer to owner failed");
            console.log("Amount transferred to owner:", bet.amount);

            // Trasferisci l'NFT al vincitore
            _transfer(ownerOf(nftId), bet.winner, nftId);
        }

        emit BetResolved(betId, bet.winner);
        console.log("Bet resolved successfully with winner:", bet.winner);
    }
}