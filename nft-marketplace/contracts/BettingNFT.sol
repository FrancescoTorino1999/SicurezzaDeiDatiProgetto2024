// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BettingNFT is ERC721, Ownable {
    struct Bet {
        address user1;
        address user2;
        uint256 amount;
        bool resolved;
        address winner;
        bool outcome; // true = heads, false = tails
    }

    mapping(uint256 => Bet) public bets; // Bet ID -> Bet details
    mapping(uint256 => uint256) public nftToBetId; // NFT ID -> Bet ID
    uint256 public betCount;
    uint256 public nftIdCounter;

    constructor() ERC721("BettingNFT", "BET") Ownable(msg.sender) {
        nftIdCounter = 0;
        betCount = 0;
    }

    // Funzione per mintare un NFT
    function mintNFT(address to) public onlyOwner {
        _safeMint(to, nftIdCounter);
        nftIdCounter++;
    }

    event BetPlaced(uint256 betId, uint256 nftId, address indexed user1, uint256 amount);
    event BetJoined(uint256 betId, address indexed user2);
    event BetResolved(uint256 betId, address indexed winner, bool outcome);

    // Mint a new NFT and create a bet
    function createBet(uint256 amount) public payable returns (uint256) {
        require(msg.value == amount, "Must send the exact betting amount");

        uint256 newNftId = nftIdCounter;
        uint256 newBetId = betCount;

        bets[newBetId] = Bet({
            user1: msg.sender,
            user2: address(0),
            amount: amount,
            resolved: false,
            winner: address(0),
            outcome: false
        });

        nftToBetId[newNftId] = newBetId;

        _safeMint(msg.sender, newNftId);

        nftIdCounter++;
        betCount++;

        emit BetPlaced(newBetId, newNftId, msg.sender, amount);

        return newBetId;
    }

    // Join an existing bet
    function joinBet(uint256 betId) public payable {
        Bet storage bet = bets[betId];
        require(bet.user2 == address(0), "Bet already joined");
        require(msg.value == bet.amount, "Must send the exact betting amount");

        bet.user2 = msg.sender;

        emit BetJoined(betId, msg.sender);
    }

    // Resolve a bet and transfer the NFT ownership
    function resolveBet(uint256 betId, bool outcome) public onlyOwner {
        Bet storage bet = bets[betId];
        require(!bet.resolved, "Bet already resolved");
        require(bet.user2 != address(0), "Bet needs two participants");

        bet.resolved = true;
        bet.outcome = outcome;

        address winner = outcome ? bet.user1 : bet.user2;
        bet.winner = winner;

        // Transfer the NFT to the winner
        uint256 nftId = nftToBetId[betId];
        _transfer(ownerOf(nftId), winner, nftId);

        // Transfer funds to the winner
        payable(winner).transfer(bet.amount * 2);

        emit BetResolved(betId, winner, outcome);
    }
}