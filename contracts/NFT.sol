// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

//URIs basically point metadata of NFT

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;

    constructor(address marketplaceAddress) ERC721("Sugarcane Tokens", "CANE") {
        contractAddress = marketplaceAddress;
    }

    function createToken(string memory tokenURI) public returns (uint) {
        _tokenIds.increment(); //Increases the count of tokenIds 
        uint256 newItemId = _tokenIds.current(); //Assigns the current count value to the item

        _mint(msg.sender, newItemId); //mints the token, passes msg.sender as the creator & newItemId as the Item ID
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true); //Gives marketplace the approval to transact the token between users from within another contract
        return newItemId; //to put the token for sale after minting we need the ID of the token
    }
}