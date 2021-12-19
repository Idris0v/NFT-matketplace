const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CBMarket", function () {
  let market;
  let marketAddress;
  let nft;
  let nftContractAddress;
  let signers;
  beforeEach(async () => {
    signers = await ethers.getSigners();
    console.log(signers[0]);
    const CBMarket = await ethers.getContractFactory("CBMarket");
    market = await CBMarket.deploy();
    await market.deployed();
    marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    nftContractAddress = nft.address;
  });

  it("Should set an owner", async function () {

    expect(await market.owner()).to.be.properAddress;
  });

  it("Should mint an NFT", async function () {
    const listingPrice = await market.listingPrice().then(price => price.toString);
    const auctionPrice = ethers.utils.parseUnits('100', 'ether');

    const nftId1 = await nft.mintToken('http-uri-1');
    const nftId2 = await nft.mintToken('http-uri-2');

    await market.createMarketItem(nftContractAddress, nftId1, auctionPrice, {value: listingPrice});
    await market.createMarketItem(nftContractAddress, nftId2, auctionPrice, {value: listingPrice});
    const [_, buyer] = await ethers.getSigners();

    let itemsUnsold = await market.fetchMarketTokens();
    expect(itemsUnsold.length).to.equal(2);

    console.log('itemsUnsold', itemsUnsold);
    await market.connect(buyer).createMarketSale(nft, nftId1, {value: auctionPrice});

    itemsUnsold = await market.fetchMarketTokens();
    expect(itemsUnsold.length).to.equal(1);

    const myNfts = market.connect(buyer).fetchMyNfts();
    expect(myNfts.length).to.equal(1);
  });
});
