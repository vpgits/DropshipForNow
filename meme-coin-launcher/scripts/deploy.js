const hre = require("hardhat");

async function main() {
  const MemeCoin = await hre.ethers.getContractFactory("MemeCoin");
  const memeCoin = await MemeCoin.deploy("MemeCoin", "MEME", hre.ethers.utils.parseEther("1000000"));

  await memeCoin.deployed();

  console.log("MemeCoin deployed to:", memeCoin.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });