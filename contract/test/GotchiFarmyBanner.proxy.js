const {expect} = require('chai');
const {solidity} = require("ethereum-waffle");
const {ethers} = require("hardhat");


let GotchiFarmyBanner;
let gotchiFarmyBanner;

// Start test block
describe('GotchiFarmyBanner (proxy)', function () {
    // Deploy the contract
    beforeEach(async function () {
        GotchiFarmyBanner = await ethers.getContractFactory("GotchiFarmyBanner",);
        gotchiFarmyBanner = await upgrades.deployProxy(GotchiFarmyBanner);
    });

    describe("Testing init value", function () {
        it("Should get every init as asked", async function () {
            let mintPrice = await gotchiFarmyBanner.price();
            expect(mintPrice).to.equal(ethers.utils.parseEther("5"));
            console.log('\t', "Mint price : ", ethers.utils.formatEther(mintPrice));

            let tokenSymbol = await gotchiFarmyBanner.symbol();
            expect(tokenSymbol).to.equal("BANNER");
            console.log('\t', "Token Symbol : ", tokenSymbol);

            let tokenName = await gotchiFarmyBanner.name();
            expect(tokenName).to.equal("Gotchi Farmy Banner");
            console.log('\t', "Token name : ", tokenName);

            let pauseStatus = await gotchiFarmyBanner.paused();
            expect(pauseStatus).to.equal(true);
            console.log('\t', "Pause status : ", pauseStatus);
        });
    });

    describe("Test owner", function () {
        it('To check everything about the owner ', async function () {
            const [owner, newOwner] = await ethers.getSigners();

            expect(await gotchiFarmyBanner.owner()).to.equal(owner.address);
            console.log('\t', " 🧑‍🏫 Owner Address: ", owner.address);

            await gotchiFarmyBanner.transferOwnership(newOwner.address);
            expect(await gotchiFarmyBanner.owner()).to.equal(newOwner.address);
            console.log('\t', " 🧑‍🏫 New owner Address: ", newOwner.address);

        });
    });



    describe("💵 updatePrice(newPrice)", function () {
        it("Update price only the owner...", async function () {
            const [owner, nonOwner] = await ethers.getSigners();

            let oldPrice = await gotchiFarmyBanner.price();
            expect(oldPrice).to.equal(ethers.utils.parseEther("5"));

            console.log('\t', "📈 Update price as non owner should not authorize ...");
            await expect(gotchiFarmyBanner.connect(nonOwner).updatePrice(2)).to.be.revertedWith("Ownable: caller is not the owner");


            console.log('\t', "📈 Update price as owner should authorize ...")
            let updatePriceTx = await gotchiFarmyBanner.connect(owner).updatePrice(2);
            console.log('\t', " 🏷  Update Result: ", updatePriceTx.hash);

            let newPrice = await gotchiFarmyBanner.price();
            expect(newPrice).to.equal(ethers.BigNumber.from(2));
        });
    });



    describe("⏯ pause() unpause()", function () {
        it("Update pause status only the owner...", async function () {
            const [owner, nonOwner] = await ethers.getSigners();

            let oldPause = await gotchiFarmyBanner.paused();
            expect(oldPause).to.equal(true);

            console.log('\t', "▶️ Call unpause as non owner should not authorize ...");
            await expect(gotchiFarmyBanner.connect(nonOwner).unpause()).to.be.revertedWith("Ownable: caller is not the owner");



            console.log('\t', "⏸ Update pause as owner should authorize ...")
            let updatePauseTx = await gotchiFarmyBanner.connect(owner).unpause();
            console.log('\t', "🏷  Update Pause Tx : ", updatePauseTx.hash);

            let newPause = await gotchiFarmyBanner.paused();
            expect(newPause).to.equal(false);


            console.log('\t', "⏸️ Call pause as non owner should not authorize ...");
            await expect(gotchiFarmyBanner.connect(nonOwner).pause()).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("💵 mint()", function () {
        it("Free for the owner paid for the other...", async function () {
            const [owner, nonOwner] = await ethers.getSigners();

            console.log('\t', "▶️ Unpause the contract as owner ...");
            let updatePauseTx = await gotchiFarmyBanner.connect(owner).unpause();
            console.log('\t', "🏷  Update Pause Tx : ", updatePauseTx.hash);

            console.log('\t', " 💸 Minting one as owner should authorize ...")
            let mintBannerAsAdminResult = await gotchiFarmyBanner.connect(owner).mint(1, 1);
            console.log('\t', " 🏷  Minting Result: ", mintBannerAsAdminResult.hash)

            let ownerNewBalance = await gotchiFarmyBanner.balanceOf(owner.address, 1);
            expect(ownerNewBalance).to.equal(1);

            /* Not functionnal because nonOwner don't get the nft because is doesn't exist yet
            console.log('\t', " 💸 Minting one as non owner should refuse ...")
            await expect(gotchiFarmyBanner.connect(nonOwner).mint(1,1,{value: ethers.utils.parseEther("5")})).to.be.revertedWith("User is not admin or don't possed one of the NFT required or not enought matic");
            console.log('\t', " 🏷  Minting Result: ", mintBannerResult.hash)

            console.log('\t', " 💸 Minting one as non owner of the nft should not refuse ...")
            let mintNonOwnerTx = await gotchiFarmyBanner.connect(nonOwner).mint(1,1,{value: ethers.utils.parseEther("5")});
            console.log('\t', " 🏷  Minting Result: ", mintNonOwnerTx.hash)


            let nonOwnerNewBalance = await gotchiFarmyBanner.balanceOf(nonOwner.address, 1);
            expect(nonOwnerNewBalance).to.equal(1);
             */
        });
    });

    describe("💵 withdraw()", function () {
        it("Should let the owner (and nobody else) withdraw the eth from the contract...", async function () {
            const [owner, nonOwner] = await ethers.getSigners();

            console.log('\t', "▶️ Unpause the contract as owner ...");
            let updatePauseTx = await gotchiFarmyBanner.connect(owner).unpause();
            console.log('\t', "🏷  Update Pause Tx : ", updatePauseTx.hash);


            /*
            console.log('\t', " 💸 Minting one as now owner should not refuse ...")
            await expect(gotchiFarmyBanner.connect(nonOwner).mint(1,1,{value: ethers.utils.parseEther("5")})).to.be.revertedWith("User is not admin or don't possed one of the NFT required or not enought matic");
            console.log('\t', " 🏷  Minting Result: ", mintBannerResult.hash)
            */

            console.log('\t', " ⏳ Waiting for confirmation...")
            const mintingAdminTxResult = await mintBannerAsAdminResult.wait()
            expect(mintingAdminTxResult.status).to.equal(1);

            const gotchiFarmyBannerBalance = await ethers.provider.getBalance(gotchiFarmyBanner.address)
            console.log('\t', " ⚖️  Starting GotchiFarmyBanner contract balance: ", ethers.utils.formatEther(gotchiFarmyBannerBalance))

            console.log('\t', " 🍾 Withdrawing as non-owner (should fail)...")
            const startingNonOwnerETHBalance = await ethers.provider.getBalance(nonOwner.address)
            console.log('\t', " ⚖️  Starting non-owner ETH balance: ", ethers.utils.formatEther(startingNonOwnerETHBalance))

            await expect(gotchiFarmyBanner.connect(nonOwner).withdraw()).to.be.revertedWith("Ownable: caller is not the owner");
            console.log('\t', " 🏷  withdraw failed with correct error");

            const newNonOwnerETHBalance = await ethers.provider.getBalance(nonOwner.address)
            console.log('\t', " 🔎 New non-owner ETH balance: ", ethers.utils.formatEther(newNonOwnerETHBalance))
            expect(newNonOwnerETHBalance).to.equal(startingNonOwnerETHBalance);

            console.log('\t', " 🍾 Withdrawing as owner...")
            const startingOwnerETHBalance = await ethers.provider.getBalance(owner.address)
            console.log('\t', " ⚖️  Starting owner ETH balance: ", ethers.utils.formatEther(startingOwnerETHBalance))
            const withdrawResult = await gotchiFarmyBanner.withdraw();
            console.log('\t', " 🏷  withdraw Result: ", withdrawResult.hash);

            console.log('\t', " ⏳ Waiting for confirmation...")
            const withdrawTxResult = await withdrawResult.wait()
            expect(withdrawTxResult.status).to.equal(1);

            const newOwnerETHBalance = await ethers.provider.getBalance(owner.address)
            console.log('\t', " 🔎 New owner ETH balance: ", ethers.utils.formatEther(newOwnerETHBalance))

            const tx = await ethers.provider.getTransaction(withdrawResult.hash);
            const receipt = await ethers.provider.getTransactionReceipt(withdrawResult.hash);
            const gasCost = tx.gasPrice.mul(receipt.gasUsed);
            console.log("Gas cost :", gasCost);
            //expect(newOwnerETHBalance).to.equal(startingOwnerETHBalance.add(gotchiFarmyBannerBalance).sub(ethers.BigNumber.from(gasCost)));
        });
    })
});