// Importa i moduli necessari
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const Certificate = require("./models/Certificate"); // importa il modello del certificato

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
        const certificates = await Certificate.find().limit(100); // recupera tutti i certificati
        res.json(certificates); // restituisce i certificati in formato JSON
    } catch (err) {
        console.error("Errore nel recupero dei certificati:", err);
        res.status(500).json({ message: err.message });
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
  

// Avvia il server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
