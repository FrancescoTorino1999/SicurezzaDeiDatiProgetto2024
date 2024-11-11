const mongoose = require("mongoose");
const dotenv = require("dotenv");
const crypto = require("crypto"); // per generare codici certificati

dotenv.config({ path: "./.env" });

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

    /*
// Definizione dello schema per un certificato
const certificateSchema = new mongoose.Schema({
    serverName: String,
    startDate: Date,
    endDate: Date,
    issuer: String,
    certificateAuthority: String,
    status: String,
    certificateCode: String
});

// Creazione del modello
const Certificate = mongoose.model("Certificate", certificateSchema);

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
    for (let i = 1; i <= 10000; i++) {
        const randomCA = certificateAuthorities[Math.floor(Math.random() * certificateAuthorities.length)];

        certificates.push({
            serverName: `Server-${i}`,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 anno di validità
            issuer: `Issuer-${Math.floor(Math.random() * 10) + 1}`,
            certificateAuthority: randomCA,
            status: "Active",
            certificateCode: crypto.randomBytes(8).toString("hex") // codice casuale di 16 caratteri esadecimali
        });
    }

    try {
        await Certificate.insertMany(certificates);
        console.log("100 certificati attivi inseriti con successo!");
    } catch (err) {
        console.error("Errore durante l'inserimento:", err);
    }
}

// Esegui la funzione di inserimento
insertCertificates();
*/