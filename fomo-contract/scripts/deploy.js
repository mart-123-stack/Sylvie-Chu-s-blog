const hre = require("hardhat");

async function main() {
  const CanvasFOMO = await hre.ethers.getContractFactory("CanvasFOMO");
  const contract = await CanvasFOMO.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`CanvasFOMO deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
