require("@nomiclabs/hardhat-waffle");

const fs = require('fs');
const privateKey = fs.readFileSync("./private-key.txt").toString().trim();


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "mumbai",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: "https://polygon-mumbai.infura.io/v3/eb722719d0fa46c69864a5df08e71b0f",
      accounts: [privateKey],
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};
