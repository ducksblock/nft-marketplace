// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; //prevents reentry attacks

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds; //Counter for Item ID
    Counters.Counter private _itemsSold; 
    //Sol doesn't have dynamic linked arrays so we need counter for items sold to keep track of array items
    
    address payable owner; 
    //If someone lists this item they have to pay the listing fee and owner of this contract can make commission on everyone else's tnx
    uint256 listingPrice = 0.025 ether; //this ether will work as matic in polygon

    constructor() { 
        owner = payable(msg.sender); //Sets the owner as msg.sender, owner of this contract is the person deployning it    
    }

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem; 
    //fetches market item based on the market id, item id returns a market item

    event MarketItemCreated(
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );//indexed keyword tells event objects to log the value or input. Index parameters of logged events will  allow you to search for these events using the indexed parameters as filters.
    //indexed keyword is only relevant to logged events
    
    function getListingPrice() public view returns (uint256) { //function that returns listing price for front-end
        return listingPrice;
    }

    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    )  public payable nonReentrant { //using nonReentrant modifier to prevent reentry attack
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingPrice, "Price must be equal to listing price");
        
        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem ( //mapping for market id by creating MarketItem
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)), //payable owner: seller is putting it for sale and no one owns it at this point so owner address is set to 0 (none)
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId); //imported IERC721 from openzeppelin
        //Transferring ownership from NFT(msg.sender) to contract itself(address(this))
        
        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    function createMarketSale(
        address nftContract,
        uint256 itemId
    )  public payable nonReentrant {
        uint price = idToMarketItem[itemId].price; //using mapping to get price
        uint tokenId = idToMarketItem[itemId].tokenId;

        require(msg.value == price, "Please submit the asking price in order to complete the process");

        idToMarketItem[itemId].seller.transfer(msg.value); //transferring ownership to seller
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId); 
        idToMarketItem[itemId].owner = payable(msg.sender); //updating mappings
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(listingPrice); //paying the owner of the contract (the commission to owner)   
    }

    //function for NFTs that have not been purchased by anyone
    function fetchMarketItems() public view returns (MarketItem[] memory) { //returns the array of market items
        uint itemCount = _itemIds.current(); //total # of items that have been currently created
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint currentIndex = 0; //for looping purpose. If it returns an empty address that means that the item has not been sold yet and we can use that data for unsold items' list.

        MarketItem[] memory items = new MarketItem[](unsoldItemCount); //if the item has not been sold we are inserting them into this array
        for(uint i = 0; i < itemCount; i++) {
            if(idToMarketItem[i+1].owner == address(0)) { //check to see if the item is unsold by verifying the address to be empty
                uint currentId = idToMarketItem[i+1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId]; //gets the mapping of currentId
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    //function for NFTs we have purchased
    function fetchMyNFTs() public view returns(MarketItem[] memory) { //this returns only the NFTs that the user has created
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;
        
        for(uint i = 0; i < totalItemCount; i ++) {
            if(idToMarketItem[i+1].owner == msg.sender) {
                itemCount += 1;
            }//fetches or loop overs every single item that we have owned and increases itemCount in array
        }

        MarketItem[] memory items = new MarketItem[](itemCount); //itemCount is the length of the array, if the increment is by 5 then it will have 5 items
        for (uint i = 0; i < totalItemCount; i++) {
            if(idToMarketItem[i+1].owner == msg.sender) {//if we own the NFT item
                uint currentId = idToMarketItem[i+1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for(uint i = 0; i < totalItemCount; i ++) {
            if(idToMarketItem[i+1].seller == msg.sender) {
                itemCount += 1;
            }
        } 

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if(idToMarketItem[i+1].seller == msg.sender) {
                uint currentId = idToMarketItem[i+1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1; 
            }
        }
        return items;
    }
}