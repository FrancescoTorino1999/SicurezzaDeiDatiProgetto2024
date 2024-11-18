// Importa i moduli necessari
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const web3 = require('../config/web3Config'); // Configurazione di web3
const Certificate = require("./models/Certificate"); // Modello del certificato
const { ethers } = require("ethers");
const { v4: uuidv4 } = require('uuid');


const contractAddress = "0xE2ECf41969342f255299196263Fc63f2a35a6c26";
const contractABI = require("./CertificateABI.json");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8100;

// Verifica che MONGO_URI sia definito nell'ambiente
if (!process.env.MONGO_URI) {
    console.error("MONGO_URI non definito. Verifica il file .env.");
    process.exit(1); // Termina il processo se la variabile non è definita
}

// Middleware
app.use(cors());
app.use(express.json()); // Abilita il parsing JSON per richieste POST/PUT

// Connetti a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

// Endpoint per ottenere i certificati
app.get("/api/certificates", async (req, res) => {
    try {
        // Recupera tutti i certificati
        const certificates = await Certificate.find();

        // Filtro manuale: rimuovi i certificati con sia bettertesta che bettercroce impostati
        const filteredCertificates = [];
        for (const certificate of certificates) {
            if (!(certificate.bettertesta !== " " && certificate.bettercroce !== " ")) {
                filteredCertificates.push(certificate);
            }
        }

        res.status(200).json(filteredCertificates);
    } catch (error) {
        console.error("Errore nel recupero dei certificati:", error);
        res.status(500).send("Errore nel recupero dei certificati.");
    }
});

// Endpoint per ottenere un certificato specifico per ID
app.get("/api/certificates/:id", async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id);
        if (!certificate) return res.status(404).json({ message: "Certificato non trovato" });
        res.json(certificate);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Funzione per autenticazione tramite firma `eth_sign`
async function authenticateUser(address) {
    const message = "Autenticazione con firma";
    try {
        // Usa eth_sign per la firma del messaggio
        const signature = await web3.eth.sign(web3.utils.utf8ToHex(message), address);
        return signature;
    } catch (error) {
        console.error("Errore nella firma:", error.message);
        throw error;
    }
}

// Funzione per verificare la firma (puoi mantenerla nel controller authController se necessario)
async function verifyUser(signature, address) {
    const message = "Autenticazione con firma";
    const recoveredAddress = await web3.eth.accounts.recover(message, signature);
    return recoveredAddress === address;
}

// Funzione per generare JWT
function generateJWT(address, password) {
    return jwt.sign({ address }, password, { expiresIn: '1h' });
}

// Endpoint per autenticazione
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const address = web3.utils.toChecksumAddress(username); // Converte in un indirizzo con checksum

    try {
        // Usa la password (chiave privata) per firmare il messaggio
        const signature = await authenticateUser(address, password);
        console.log("Firma:", signature);

        // Verifica la firma
        const isValid = await verifyUser(signature, address);
        console.log("Autenticazione valida:", isValid);

        if (isValid) {
            const token = generateJWT(address, password);
            res.json({ token });
        } else {
            res.status(401).json({ message: "Autenticazione fallita" });
        }
    } catch (error) {
        res.status(500).json({ message: "Errore del server", error: error.message });
    }
});


// Endpoint per transazioni Ethereum
app.post('/ethereum/transaction', async (req, res) => {
    const { token, to, amount } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const receipt = await sendTransaction(decoded.address, to, amount);
        res.json({ receipt });
    } catch (error) {
        res.status(401).json({ message: "Autenticazione non valida", error: error.message });
    }
});

app.patch("/api/certificates/:id", async (req, res) => {
    const { id } = req.params;
    let { bettertesta, bettercroce } = req.body;

    try {
        // Assicurati che bettertesta e bettercroce siano stringhe
        if (bettertesta && typeof bettertesta === 'object') {
            bettertesta = bettertesta.address; // Estrai l'indirizzo
        }
        if (bettercroce && typeof bettercroce === 'object') {
            bettercroce = bettercroce.address; // Estrai l'indirizzo
        }

        console.log(bettercroce, bettertesta)

        const updateData = {};
        if (bettertesta) updateData.bettertesta = bettertesta;
        if (bettercroce) updateData.bettercroce = bettercroce;

        const updatedCertificate = await Certificate.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedCertificate) {
            return res.status(404).send("Certificato non trovato.");
        }

        res.status(200).json(updatedCertificate);
    } catch (error) {
        console.error("Errore durante l'updateCertificate:", error);
        res.status(500).send("Errore durante l'aggiornamento del certificato.");
    }
});

app.post("/api/bets", async (req, res) => {
    const { betId, user1, amount } = req.body;
  
    try {
      const newBet = new Bet({
        betId,
        user1,
        amount,
      });
  
      const savedBet = await newBet.save();
      res.status(201).json(savedBet);
    } catch (err) {
      console.error("Errore nel salvare la scommessa:", err);
      res.status(500).send("Errore nel salvare la scommessa.");
    }
  });

  app.patch("/api/certificates/:id/bet", async (req, res) => {
    const { id } = req.params;
    const { user, choice } = req.body;

    console.log("PATCH request received with ID:", id);
    
    console.log("Request body:", req.body);

    try {
        const certificate = await Certificate.findById(id);
        console.log("Certificate fetched from DB:", certificate);

        if (!certificate) {
            console.log("Certificate not found for ID:", id);
            return res.status(404).json({ message: "Certificato non trovato" });
        }

        // Aggiorna la scommessa basata sulla scelta
        if (choice === "Testa" && certificate.bettertesta === " ") {
            certificate.bettertesta = user;
            console.log(`User ${user} bet on "Testa"`);
        } else if (choice === "Croce" && certificate.bettercroce === " ") {
            certificate.bettercroce = user;
            console.log(`User ${user} bet on "Croce"`);
        } else {
            console.log(`Invalid or already placed bet by user: ${user}`);
            return res.status(400).json({ message: "Scommessa non valida o già effettuata" });
        }

        if (certificate.bettertesta !== " " && certificate.bettercroce !== " ") {
            //console.log("Both bets are placed. Determining winner...");
            //const winner = Math.random() < 0.5 ? certificate.bettertesta : certificate.bettercroce;
            //console.log("Winner determined:", winner);

            //certificate.owner = winner;

            // Chiama lo smart contract per registrare il vincitore
            console.log("Registering winner on blockchain...");
            const result = await registerWinnerOnBlockchain(uuidv4(), certificate.bettertesta, certificate.bettercroce, certificate.price);
            console.log("Blockchain result:", result);
        }

        console.log("Saving updated certificate to DB...");
        await certificate.save();
        console.log("Certificate updated:", certificate);

        res.json(certificate);
    } catch (error) {
        console.error("Errore durante l'aggiornamento del certificato:", error);
        res.status(500).json({ message: "Errore interno del server" });
    }
});

async function registerWinnerOnBlockchain(betId, user1, user2, amount) {
    console.log("registerWinnerOnBlockchain called with parameters:");
    console.log("betId:", betId);
    console.log("user1:", user1);
    console.log("user2:", user2);
    console.log("amount:", amount);

    try {
        console.log("Loading contract ABI and address...");
        const contractABI = require("./CertificateABI.json");
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        console.log("Contract initialized:", contract);

        const account = process.env.OWNER_ADDRESS; // Owner dell'NFT
        const privateKey = process.env.OWNER_PRIVATE_KEY;

        console.log("Account used for transaction:", account);

        // **Transazione per creare la scommessa**
        console.log("Preparing to create bet on blockchain...");
        const txCreate = contract.methods.createBet(user1, user2, web3.utils.toWei(amount.toString(), 'ether'));
        console.log("Transaction object for creating bet:", txCreate);

        const gasCreate = await txCreate.estimateGas({ from: account });
        console.log("Estimated gas for creating bet:", gasCreate);

        const gasPriceCreate = await web3.eth.getGasPrice();
        console.log("Current gas price:", gasPriceCreate);

        const dataCreate = txCreate.encodeABI();
        console.log("Encoded ABI data for creating bet:", dataCreate);

        const nonceCreate = await web3.eth.getTransactionCount(account);
        console.log("Current nonce for account:", nonceCreate);

        const signedTxCreate = await web3.eth.accounts.signTransaction(
            {
                to: contractAddress,
                data: dataCreate,
                gas: gasCreate,
                gasPrice: gasPriceCreate,
                nonce: nonceCreate,
            },
            privateKey
        );

        console.log("Signed transaction for creating bet:", signedTxCreate);

        const receiptCreate = await web3.eth.sendSignedTransaction(signedTxCreate.rawTransaction);
        console.log("Transaction receipt for creating bet:", JSON.stringify(receiptCreate, null, 2));

        // **Recupera l'ID della scommessa**
        console.log("Retrieving BetCreated event from receipt...");
        const betCreatedEvent = receiptCreate.logs.find(
            (log) => log.topics && log.topics[0] === web3.utils.sha3("BetCreated(uint256,address,address,uint256)")
        );

        if (!betCreatedEvent) {
            console.log("BetCreated event not found in transaction receipt.");
            throw new Error("BetCreated event not found in receipt.");
        }

        console.log("BetCreated event found:", betCreatedEvent);

        const resolvedBetId = web3.eth.abi.decodeParameter("uint256", betCreatedEvent.data);
        console.log("Bet ID retrieved from BetCreated event:", resolvedBetId);

        // **Transazione per risolvere la scommessa**
        console.log("Preparing to resolve bet on blockchain...");
        const txResolve = contract.methods.resolveBet(resolvedBetId);
        console.log("Transaction object for resolving bet:", txResolve);

        const gasResolve = await txResolve.estimateGas({ from: account });
        console.log("Estimated gas for resolving bet:", gasResolve);

        const gasPriceResolve = await web3.eth.getGasPrice();
        console.log("Current gas price for resolving bet:", gasPriceResolve);

        const dataResolve = txResolve.encodeABI();
        console.log("Encoded ABI data for resolving bet:", dataResolve);

        const nonceResolve = await web3.eth.getTransactionCount(account);
        console.log("Current nonce for resolving transaction:", nonceResolve);

        const signedTxResolve = await web3.eth.accounts.signTransaction(
            {
                to: contractAddress,
                data: dataResolve,
                gas: gasResolve,
                gasPrice: gasPriceResolve,
                nonce: nonceResolve,
            },
            privateKey
        );

        console.log("Signed transaction for resolving bet:", signedTxResolve);

        const receiptResolve = await web3.eth.sendSignedTransaction(signedTxResolve.rawTransaction);
        console.log("Transaction receipt for resolving bet:", JSON.stringify(receiptResolve, null, 2));

        // **Recupera il vincitore dagli eventi**
        console.log("Retrieving BetResolved event from receipt...");
        const winnerEvent = receiptResolve.logs.find(
            (log) => log.topics && log.topics[0] === web3.utils.sha3("BetResolved(uint256,address)")
        );

        if (!winnerEvent) {
            console.log("BetResolved event not found in transaction receipt.");
            throw new Error("Winner not found in BetResolved event.");
        }

        console.log("BetResolved event found:", winnerEvent);

        const winner = web3.eth.abi.decodeParameter("address", winnerEvent.data);
        console.log("Winner retrieved from BetResolved event:", winner);

        return { success: true, receipts: { create: receiptCreate, resolve: receiptResolve }, winner };
    } catch (error) {
        console.error("Error during blockchain interaction:", error);
        return { success: false, error: error.message };
    }
}
// Avvia il server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
