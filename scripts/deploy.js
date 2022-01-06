const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const Market = await hre.ethers.getContractFactory("CBMarket");
  const market = await Market.deploy();
  await market.deployed();

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(market.address);
  await nft.deployed();

  console.log(`Market deployed to: ${market.address} \nNFT deployed to: ${nft.address}`);
  const config = `
  export const nftAddress = '${nft.address}';
  export const marketAddress = '${market.address}';
  `;
  fs.writeFileSync('config.js', config);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
