const web3 = require('../config/web3Config');

exports.sendTransaction = async (from, to, amount) => {
  try {
    const receipt = await web3.eth.sendTransaction({
      from,
      to,
      value: web3.utils.toWei(amount, 'ether')
    });
    return receipt;
  } catch (error) {
    console.error("Errore durante la transazione:", error.message);
    throw error;
  }
};
