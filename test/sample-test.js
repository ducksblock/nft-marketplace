const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {
    const Market = await ethers.getContractFactory("NFTMarket"); //to deploy NFT market we need to get a reference to that contract
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;
    //deploy market and await for it to be deployed then we get the address from which it was deployed

    const NFT = await ethers.getContractFactory("NFT"); //getting a reference to NFT contract to deploy it
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftContractAddress = nft.address; //deployed both contracts now starting to interact with it

    let listingPrice = await market.getListingPrice(); //accessing contract's function getListingPrice()
    listingPrice = listingPrice.toString();

    const auctionPrice = ethers.utils.parseUnits('100', 'ether');

    await nft.createToken("https://www.mytokenlocation.com"); //creating the tokens and passing the URI of tokens
    await nft.createToken("https://www.mytokenlocation2.com");

    await market.createMarketItem(nftContractAddress, 1, auctionPrice, { value: listingPrice }); //listing the tokens
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, { value: listingPrice });

    const [_, buyerAddress] = await ethers.getSigners(); //getting test accounts from ethers
    /*The above contracts will get assigned the first addresses for testing so we can ignore them by "_" underscore 
    and get the reference to the buyer address so that we don't end up having buyer and seller with the same address*/
    
    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value: auctionPrice });
    //connect the buyeraddress to the market, create market sale of the tokenid 1 with a value of 100 (auctionPrice)
    
    let items = await market.fetchMarketItems();
    /*Before adding the code below, the o/p was providing useless/garbage values with the actual result
     so we made it so that it only gives output of the mentioned values in a more readable format*/
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId);
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item;
    }));
    
    console.log("Items: ", items);
  });
});
