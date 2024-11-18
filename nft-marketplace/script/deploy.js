const hre = require("hardhat");

async function main() {
  // Ottieni la factory del contratto
  const BettingNFT = await hre.ethers.getContractFactory("BettingNFT");
  const name = "BettingNFT";
  const symbol = "BNT";
  const ownerAccount = "0x248EDFD94e8F9f6b61552732e89F0f9C3B337596";

  console.log("Deploying contract with parameters:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Owner Account:", ownerAccount);

  // Deploy del contratto
  const bettingNFT = await BettingNFT.deploy(name, symbol, ownerAccount);

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