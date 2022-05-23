require("@nomiclabs/hardhat-waffle");
const fs = require("fs");
const privKey = fs.readFileSync(".secret").toString();
const projectId = "";

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${projectId}`,
      accounts: [privKey]
    },
    mainnet: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${projectId}`,
      accounts: [privKey]
    },
  },
  solidity: "0.8.4",
};
