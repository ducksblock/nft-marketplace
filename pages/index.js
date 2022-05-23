import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';

import {
  nftaddress, nftmarketaddress
} from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

export default function Home() {
  const [nfts, setNfts] = useState([]); //fetching the nfts and setting nfts in the state which had an empty array
  const [loadingState, setLoadingState] = useState('not-loaded'); //by default keeping the state not loaded, we can update it later to loaded

  useEffect(() => { //invoking loadnfts function when the app loads with the help of useEffect hook
    loadNFTs();
  }, [])
  
  async function loadNFTs() { //to call our smart contracts and fetch nfts
    const provider = new ethers.providers.JsonRpcProvider("https://matic-mumbai.chainstacklabs.com");
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider); //fetching items with the help of reference
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider);

    const data = await marketContract.fetchMarketItems(); //getting the data

    const items = await Promise.all(data.map(async i => { //mapping the fetched items
      const tokenUri = await tokenContract.tokenURI(i.tokenId); //call the token contract and get the tokenuri to interact with the contract
      const meta = await axios.get(tokenUri); //to get the metadata
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether'); //setting price for the item property
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      } 
      return item;
    }));
    setNfts(items); //setting the updated items array
    setLoadingState('loaded');
  }

  async function buyNft(nft) {
    const web3Modal = new Web3Modal(); //to connect to the user wallet to sign txn
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection); //creating provider using user's address (connection)

    const signer = provider.getSigner(); //for user to sign the txn
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether'); //getting the ref to price

    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
      value: price
    });
    await transaction.wait();
    loadNFTs(); //reloading the nfts so that it shows 1 less nft for successful txn (sold nft)
  }

  if(loadingState === 'loaded' && !nfts.length) return (
    <h1 className='px-20 py-10 text-3xl'>No items in the marketplace yet</h1>
  )

  return ( //displaying the nfts
    <div className='flex justify-center'>
      <div className='px-4' style={{ maxWidth: '1600px' }}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'> {/* adjusting columns based on screen size */}
          {
            nfts.map((nft, i) => ( /* mapping nfts and for each nft we'll return something */
               <div key={i} className='border shadow rounded-xl overflow-hidden'>
                 <img src={nft.image} /> 
                 {/* nft image */}

                 <div className='p-4'>      
                  <p style={{ height: '64px' }} className='text-2xl font-semibold'>{nft.name}</p>
                  {/* name of the nft */}
                  <div style={{ height:'70px', overflow: 'hidden' }}>
                    <p className='text-gray-400'>{nft.description}</p>
                    {/* nft description */}
                  </div>
                 </div>

                 <div className='p-4 bg-black'>
                  <p className='text-2xl mb-4 font-bold text-white'>{nft.price} MATIC</p>
                  {/* price of nft */}
                  <button className='w-full bg-orange-500 text-white font-bold py-2 px-12 rounded' onClick={() => buyNft(nft)}>Buy</button>
                 </div>

               </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
