const jwt = require('jsonwebtoken');
const web3 = require('../config/web3Config');

const message = "Autenticazione con firma";

exports.authenticateUser = async (address) => {
  try {
    const signature = await web3.eth.personal.sign(message, address, 'password_dell_account');
    return signature;
  } catch (err) {
    console.error("Errore nella firma:", err.message);
    throw err;
  }
};

exports.verifyUser = async (signature, address) => {
  const recoveredAddress = await web3.eth.personal.ecRecover(message, signature);
  return recoveredAddress === address;
};

exports.generateJWT = (userAddress) => {
  return jwt.sign({ address: userAddress }, 'tuo_segreto_jwt', { expiresIn: '1h' });
};
