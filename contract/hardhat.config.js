require('@nomiclabs/hardhat-waffle');
require("@nomiclabs/hardhat-etherscan");
require('@openzeppelin/hardhat-upgrades');
const dotenv = require("dotenv");
dotenv.config({path: __dirname + '/.env'});
const {URL_ALCHEMY_POLYGON_MUMBAI, URL_ALCHEMY_POLYGON, PRIVATE_KEY, ETHERSCAN_API_KEY} = process.env;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.13',
  networks: {
    polygonMumbai: {
      url: URL_ALCHEMY_POLYGON_MUMBAI,
      accounts: [PRIVATE_KEY]
    },
    polygon: {
      url: URL_ALCHEMY_POLYGON,
      accounts: [PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: ETHERSCAN_API_KEY,
      polygon: ETHERSCAN_API_KEY
    }
  }
};