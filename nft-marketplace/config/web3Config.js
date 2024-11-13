// config/web3Config.js
const Web3 = require('web3');  // Importa il modulo web3
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545')); // URL di Ganache

module.exports = web3;

