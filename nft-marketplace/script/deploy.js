const hre = require("hardhat");

async function main() {
  // Ottieni la factory del contratto
  const BettingNFT = await hre.ethers.getContractFactory("BettingNFT");

  // Deploy del contratto
  const bettingNFT = await BettingNFT.deploy();

  // Aspetta la conferma della transazione di deploy
  const deploymentReceipt = await bettingNFT.deploymentTransaction().wait();

  console.log("BettingNFT deployed to:", bettingNFT.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });