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


const contractAddress = "0x15AB41935271D01783B7F191e18B2468AbcfF639";
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

app.get("/api/allCertificatesOwned/:id", async (req, res) => {
    try {
        const id = req.params.id;
        // Recupera tutti i certificati
        const certificates = await Certificate.find();
        console.log(id)
        // Filtro manuale: rimuovi i certificati con sia bettertesta che bettercroce impostati
        const filteredCertificates = [];
        for (const certificate of certificates) {
            if (certificate.owner == id) {
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
    const { user, choice, password } = req.body;

    try {
        const certificate = await Certificate.findById(id);

        if (!certificate) {
            return res.status(404).json({ message: "Certificato non trovato" });
        }

        // Verifica se la scelta è valida e aggiorna il certificato
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

        // Importo della scommessa
        const amount = certificate.price; // Converte il prezzo in wei

        
        // Configura il contratto
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Prepara la transazione per il pagamento
        const tx = contract.methods.joinBet(id, choice,);
        const gasEstimate = await contract.methods.joinBet(id, choice).estimateGas({
            from: user,
            value: amount,
        });
        const gas = Math.ceil(gasEstimate * 1.5);
        const gasPrice = await web3.eth.getGasPrice();
        const data = tx.encodeABI();
        const nonce = await web3.eth.getTransactionCount(user);

        // Firma e invia la transazione
        const signedTx = await web3.eth.accounts.signTransaction(
            {
                to: contractAddress,
                data,
                gas,
                gasPrice,
                value: amount,
                nonce,
            },
            password // La chiave privata dell'utente
        );

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(receipt);

        if (certificate.bettercroce !== " " && certificate.bettertesta !== " ") {
            let winner = null;
        
            winner = await contract.methods.getWinner(id).call();
        
            
            certificate.owner = winner;
            
        
        }
        // Salva il certificato modificato
        console.log("Saving updated certificate to DB...");
        await certificate.save();
        console.log("Certificate updated:", certificate);
        res.json(certificate);
    } catch (error) {
        console.error("Errore durante l'aggiornamento del certificato o la transazione:", error);
        res.status(500).json({ message: "Errore durante l'aggiornamento del certificato o la transazione", error: error.message });
    }
});



// Avvia il server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
