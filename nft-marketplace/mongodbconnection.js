const mongoose = require("mongoose");
const dotenv = require("dotenv");
const crypto = require("crypto"); // per generare codici certificati

dotenv.config({ path: "./.env" });

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

    const Certificate = require('./backend/models/Certificate'); // Assicurati che il percorso sia corretto
    
    // Funzione per creare dati fittizi e inserire i nuovi certificati
    async function insertCertificates() {
        // Elimina tutti i certificati esistenti
        await Certificate.deleteMany({});
        console.log("Certificati precedenti eliminati.");
    
        // Liste di autorità di certificazione comuni
        const certificateAuthorities = [
            "Let's Encrypt", "DigiCert", "GlobalSign", "Sectigo", "GoDaddy", "Entrust", "Certum", "GeoTrust", "RapidSSL", "Comodo"
        ];
    
        const certificates = [];
        for (let i = 1; i <= 100; i++) {
            const randomCA = certificateAuthorities[Math.floor(Math.random() * certificateAuthorities.length)];
            
            // Genera una data casuale tra oggi e tre mesi nel futuro
            const today = new Date();
            const threeMonthsFromNow = new Date();
            threeMonthsFromNow.setMonth(today.getMonth() + 3);
            const expiringBetDate = new Date(today.getTime() + Math.random() * (threeMonthsFromNow.getTime() - today.getTime()));
            
            const min = 10; // 1000 / 100
            const max = 20; // 2000 / 100
            const randomMultiplier = Math.floor(Math.random() * (max - min + 1)) + min;
        
            const ethPrice = Math.floor(randomMultiplier * 55279.16); // Converte da euro a ETH


            certificates.push({
                certificateId: crypto.randomBytes(8).toString("hex"), // ID unico per ogni certificato
                serverName: `Server-${i}`,
                issuedDate: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 anno di validità
                issuingCA: randomCA,
                status: "Active",
                publicKey: crypto.randomBytes(32).toString("hex"), // Chiave pubblica fittizia
                privateKey: crypto.randomBytes(32).toString("hex"), // Chiave privata fittizia
                owner: " ", // Campo owner vuoto
                expiringBetDate: expiringBetDate.toISOString(), // Data casuale entro tre mesi
                certificateAuthority: randomCA,
                bettertesta: " ",
                bettercroce: " ",
                price: ethPrice
            });
        }
    
        try {
            await Certificate.insertMany(certificates);
            console.log("100 certificati inseriti con successo!");
        } catch (err) {
            console.error("Errore durante l'inserimento:", err);
        }
    }
    
    // Esegui la funzione di inserimento
    insertCertificates();
    