const { Wallet } = require("ethers");

async function main() {
  const wallet = Wallet.createRandom(); // Genera un nuovo account casuale

  console.log("Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });