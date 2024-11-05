# NFT Marketplace - Certificati Server su Blockchain

Questo progetto crea un marketplace di NFT per certificati server, utilizzando la blockchain Ethereum. Il marketplace permette di acquistare e vendere certificati unici, gestiti come token ERC-721.

## 1. Setup dell’Ambiente di Sviluppo

### Installa Node.js e npm
Scarica e installa [Node.js](https://nodejs.org/). Verifica l'installazione con:
```bash
node -v
npm -v
Configura MongoDB
Crea un database MongoDB su MongoDB Atlas o in locale.
Installa Mongosh per interagire con MongoDB.
Configura Ganache
Scarica e installa Ganache per creare una blockchain locale.
Apri Ganache e avvia un nuovo progetto per generare account di prova con ETH simulato.
Configura Metamask
Aggiungi Metamask come estensione su Chrome.
Configura Metamask per connetterti a Ganache, aggiungendo una nuova rete con i dettagli RPC di Ganache (es. http://127.0.0.1:7545).
2. Creazione del Contratto Smart per gli NFT
Imposta Hardhat
Installa Hardhat nella tua directory del progetto:


npm install --save-dev hardhat
Crea un nuovo progetto Hardhat:


npx hardhat
Seleziona l’opzione per creare un progetto JavaScript di base.

Installa OpenZeppelin
Installa la libreria OpenZeppelin per utilizzare il template ERC-721:

npm install @openzeppelin/contracts
Crea il Contratto per i Certificati NFT
Nella cartella contracts, crea un file chiamato CertificateNFT.sol e aggiungi il seguente codice:


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CertificateNFT is ERC721 {
    uint256 public tokenCounter;

    struct Certificate {
        string serverName;
        string issueDate;
        string expiryDate;
    }

    mapping(uint256 => Certificate) public certificates;

    constructor() ERC721("CertificateNFT", "CERT") {
        tokenCounter = 0;
    }

    function createCertificate(string memory _serverName, string memory _issueDate, string memory _expiryDate) public returns (uint256) {
        uint256 newTokenId = tokenCounter;
        _safeMint(msg.sender, newTokenId);
        certificates[newTokenId] = Certificate(_serverName, _issueDate, _expiryDate);
        tokenCounter++;
        return newTokenId;
    }
}
Testa e Deploya il Contratto su Ganache
Modifica il file hardhat.config.js per connettere Hardhat a Ganache:


module.exports = {
    solidity: "0.8.0",
    networks: {
        development: {
            url: "http://127.0.0.1:7545",
            accounts: [/* Inserisci le chiavi private di Ganache */]
        }
    }
};
Esegui il deploy:

npx hardhat run scripts/deploy.js --network development
3. Impostazione del Backend con Express e MongoDB
Crea il Server Express
Inizia un progetto Node.js:


npm init -y
npm install express mongoose dotenv jsonwebtoken
Crea un file server.js e configura Express e MongoDB:


const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.listen(5000, () => console.log("Server running on port 5000"));
Aggiungi l’Autenticazione con JWT
Crea middleware per l'autenticazione e proteggi le route usando JWT. Configura anche le route per la gestione degli utenti e degli NFT.

4. Sviluppo del Frontend con React
Crea un’App React
Genera una nuova app React:

npx create-react-app nft-marketplace
Aggiungi Web3.js per Connetterti a Ethereum
Installa Web3.js:

npm install web3
Configura la connessione a Metamask e al contratto:

import Web3 from "web3";

async function connectToBlockchain() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
    await window.ethereum.enable(); // Richiede autorizzazione a Metamask
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
}
Crea le Pagine del Marketplace
Crea una pagina principale per visualizzare tutti i certificati disponibili.
Crea pagine di dettaglio per ogni NFT con opzioni di acquisto.
5. Implementazione delle Funzioni di Acquisto e Vendita
Aggiungi Funzionalità di Acquisto nel Contratto
Modifica il contratto per includere funzioni di acquisto o vendita. Puoi definire un prezzo di base e trasferire i certificati ai compratori.

Integra le Funzioni nel Frontend
Usa Web3.js per richiamare le funzioni di trasferimento sul contratto quando un utente vuole acquistare un certificato.

6. Testa e Debugga
Testa l'applicazione su Ganache per verificare che tutte le transazioni funzionino correttamente.
Effettua debug degli errori sul frontend e backend e assicurati che i certificati vengano visualizzati correttamente.
7. Deploy Finale
Effettua il deploy del contratto sulla rete test di Ethereum (es. Rinkeby) con Hardhat.
Distribuisci il frontend e backend su servizi come Heroku o Vercel per il frontend e MongoDB Atlas per il database.
Con questi passaggi, hai tutto il necessario per sviluppare un marketplace di NFT che funzioni come CA per certificati server su blockchain.
