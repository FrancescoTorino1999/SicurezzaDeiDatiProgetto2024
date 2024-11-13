const express = require('express');
const { authenticateUser, verifyUser, generateJWT } = require('../controllers/authController');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { address } = req.body;
  try {
    const signature = await authenticateUser(address);
    const isValid = await verifyUser(signature, address);

    if (isValid) {
      const token = generateJWT(address);
      res.json({ token });
    } else {
      res.status(401).json({ message: "Autenticazione fallita" });
    }
  } catch (error) {
    res.status(500).json({ message: "Errore del server", error: error.message });
  }
});

module.exports = router;
