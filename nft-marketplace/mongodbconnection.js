const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { execSync } = require("child_process"); // Per eseguire comandi OpenSSL
const fs = require("fs"); // Per gestire i file generati
const path = require("path");
const Certificate = require("./backend/models/Certificate");

dotenv.config({ path: "./.env" });

// Connessione a MongoDB
async function connectToMongoDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("MongoDB connected");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Termina il processo se la connessione fallisce
    }
}

// Funzione per ripulire la directory certificates
function cleanCertificatesDirectory() {
    const certDir = path.join(__dirname, "certificates");

    if (fs.existsSync(certDir)) {
        fs.readdirSync(certDir).forEach((file) => {
            const filePath = path.join(certDir, file);
            fs.unlinkSync(filePath); // Elimina ogni file nella directory
        });
        console.log("Directory certificates ripulita.");
    } else {
        fs.mkdirSync(certDir); // Crea la directory se non esiste
        console.log("Directory certificates creata.");
    }
}

// Funzione per generare chiavi e certificato con OpenSSL
function generateOpenSSLKeys(certificateId) {
    try {
        const certDir = path.join(__dirname, "certificates");

        const privateKeyPath = path.join(certDir, `${certificateId}.key`);
        const publicKeyPath = path.join(certDir, `${certificateId}.pub`);
        const certificatePath = path.join(certDir, `${certificateId}.crt`);

        // Genera chiave privata
        execSync(`openssl genrsa -out ${privateKeyPath} 2048`);

        // Genera chiave pubblica dalla chiave privata
        execSync(`openssl rsa -in ${privateKeyPath} -pubout -out ${publicKeyPath}`);

        // Genera certificato autofirmato
        execSync(`openssl req -new -x509 -key ${privateKeyPath} -out ${certificatePath} -days 365 -subj "/CN=Server-${certificateId}"`);

        console.log(`Keys and certificate generated for ID: ${certificateId}`);
        return { privateKeyPath, publicKeyPath, certificatePath };
    } catch (error) {
        console.error("Error generating OpenSSL keys:", error);
        throw error;
    }
}

// Funzione per generare certificati fittizi
function generateFakeCertificates() {
    const certificateAuthorities = [
        "Let's Encrypt", "DigiCert", "GlobalSign", "Sectigo", "GoDaddy", "Entrust", "Certum", "GeoTrust", "RapidSSL", "Comodo"
    ];

    const certificates = [];
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    for (let i = 1; i <= 100; i++) {
        const certificateId = `cert-${i}`;
        const paths = generateOpenSSLKeys(certificateId);

        const randomCA = certificateAuthorities[Math.floor(Math.random() * certificateAuthorities.length)];
        const expiringBetDate = new Date(today.getTime() + Math.random() * (threeMonthsFromNow.getTime() - today.getTime()));

        const min = 10; // 1000 / 100
        const max = 20; // 2000 / 100
        const randomMultiplier = Math.floor(Math.random() * (max - min + 1)) + min;
        const ethPrice = Math.floor(randomMultiplier * 55279.16); // Converte da euro a ETH

        certificates.push({
            certificateId,
            serverName: `Server-${i}`,
            issuedDate: today,
            expiryDate: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 anno di validità
            issuingCA: randomCA,
            status: "Active",
            publicKey: fs.readFileSync(paths.publicKeyPath, "utf-8"), // Legge la chiave pubblica
            privateKey: fs.readFileSync(paths.privateKeyPath, "utf-8"), // Legge la chiave privata
            owner: " ", 
            expiringBetDate: expiringBetDate.toISOString(),
            certificateAuthority: randomCA,
            bettertesta: " ",
            bettercroce: " ",
            price: ethPrice
        });
    }
    return certificates;
}

// Funzione per caricare i certificati nel database
async function insertCertificates() {
    try {
        await Certificate.deleteMany({});
        console.log("Previous certificates deleted.");

        const certificates = generateFakeCertificates();

        await Certificate.insertMany(certificates);
        console.log("100 certificates inserted successfully!");
    } catch (err) {
        console.error("Error during certificate insertion:", err);
    }
}

// Funzione principale
async function main() {
    await connectToMongoDB();
    cleanCertificatesDirectory(); // Ripulisce i file esistenti prima di generare nuovi certificati
    await insertCertificates();
    mongoose.disconnect();
}

// Avvio dello script
main();