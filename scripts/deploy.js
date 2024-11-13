// scripts/deploy.js

const hre = require("hardhat");

async function main() {
  // Obtém o "Factory" para o contrato DeviceRegistry
  const DeviceRegistry = await hre.ethers.getContractFactory("DeviceRegistry");

  // Implanta o contrato
  const deviceRegistry = await DeviceRegistry.deploy();

  // Aguarda a implantação ser confirmada
  await deviceRegistry.deployed();

  // Exibe o endereço do contrato implantado
  console.log("DeviceRegistry implantado em:", deviceRegistry.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erro ao implantar o contrato:", error);
    process.exit(1);
  });
