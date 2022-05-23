# NFT Marketplace Project built using Polygon, Solidity, IPFS and Next.js

This project demonstrates a full stack NFT Marketplace project built using Polygon, Solidity, Hadhat, Next.js and IPFS. User can view minted NFTs, buy the NFTs and view the owned NFTs. Seller or Creator can create NFTs, sell it and also have access to the creator dashboard where they can view created NFTs as well as sold NFTs. An overall implementation of the technologies mentioned helped me to create this project.

#### Local Setup

To run this project locally, follow these steps.

1. Clone the project locally, change into the directory, and install the dependencies:

```sh
git clone https://github.com/ducksblock/nft-marketplace.git
cd nft-marketplace
# install using NPM or Yarn
npm install
# or
yarn
```

2. Start the local Hardhat node

```sh
npx hardhat node
```

3. With the network running, deploy the contracts to the local network in a separate terminal window

```sh
npx hardhat run scripts/deploy.js --network localhost
```

4. Start the app

```
npm run dev
```
#### Mainnet or Testnet Configuration

To deploy to Polygon test or main networks, update the configurations located in __hardhat.config.js__ to use a private key and, optionally, deploy to a private RPC like Alchemy, Infura, etc.
