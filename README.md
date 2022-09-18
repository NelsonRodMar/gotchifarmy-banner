# GotchyFarmyBanner Contract

---
## ℹ️ Information about this project

In this repository you will find all the contract that manage the banner of the Gotchi Farmy Clan.  <br />
There is one contract for the distribution of the old banner create with OpenSea and a second contract for the new banner.
All the contract are deployed on the Polygon network via a proxy contract.

---
## 📝 Contract addresses

Comming soon

---
## Environment variables

Copy the `.env.dist` file to `.env` and fill in the values.

* `URL_ALCHEMY_POLYGON_MUMBAI=`  Alchemy API URL for Polygon Mumbain, used to deploy on testnet
* `URL_ALCHEMY_POLYGON=` Alchemy API URL for Polygon, used to deploy and also for the test
* `PRIVATE_KEY=` Private key of the deployer account
* `ETHERSCAN_API_KEY=` Etherscan API key, used to verify the contracts on Etherscan


---
## 🏗️ Commands
The following commands are available :

To test (⚠️ : You need to have a .env file with the URL_ALCHEMY_POLYGON because the test use the fork mainnet) :
```shell
npx hardhat test 
or 
 npx hardhat test ./test/OldBannerDistribution.proxy.js
or
npx hardhat test ./test/GotchiFarmyBanner.proxy.js
```

To deploy :
```shell
npx hardhat run --network polygon scripts/deploy.js
npx hardhat verify --network polygon DEPLOYED_CONTRACT_ADDRESS "CONSTRUCTOR_ARGUMENTS"
```