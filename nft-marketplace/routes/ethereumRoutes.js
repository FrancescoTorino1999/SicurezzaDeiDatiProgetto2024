const express = require('express');
const { sendTransaction } = require('../controllers/ethereumController');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/transaction', async (req, res) => {
  const { token, to, amount } = req.body;
  try {
    const decoded = jwt.verify(token, 'tuo_segreto_jwt');
    const receipt = await sendTransaction(decoded.address, to, amount);
    res.json({ receipt });
  } catch (error) {
    res.status(401).json({ message: "Autenticazione non valida" });
  }
});

module.exports = router;
