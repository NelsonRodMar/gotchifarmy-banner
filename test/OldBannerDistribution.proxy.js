const {expect} = require('chai');
const {ethers} = require("hardhat");
const ghstContractAbi = require("./abi/ghst.json");
const openseaContractAbi = require("./abi/opensea.json");

let OldBannerDistribution, oldBannerDistribution, gotchiFarmyVault, artist, percentageArtist, price,
nelsonRodMarWalletAddress, gotchiFarmyWalletAddress, ghstContractAddress;

// Start test block
describe('OldBannerDistribution (proxy)', function () {
    // Deploy the contract
    beforeEach(async function () {
        OldBannerDistribution = await ethers.getContractFactory("OldBannerDistribution");
        oldBannerDistribution = await upgrades.deployProxy(OldBannerDistribution);
        gotchiFarmyVault = '0x53a75d41bfc6b5F9E4D4F9769eb12CF58904F37a';
        artist = '0x860980abaD6267C6dd35D8B1C1B14Fa6741DB3A6';
        price = ethers.utils.parseEther("10");
        nelsonRodMarWalletAddress = "0x770569f85346B971114e11E4Bb5F7aC776673469";
        gotchiFarmyWalletAddress = "0xfbb073e09D84970d1eFe099aBBE9E626f8FF7024";
        ghstContractAddress = "0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7";
        percentageArtist = 1500;
    });

    describe("Testing init value", function () {
        it("Should get every value as init", async function () {
            let distributionPrice = await oldBannerDistribution.price();
            expect(distributionPrice).to.equal(ethers.utils.parseEther("10"));
            console.log('\t', "Distribution price : ", ethers.utils.formatEther(distributionPrice));

            let pauseStatus = await oldBannerDistribution.paused();
            expect(pauseStatus).to.equal(true);
            console.log('\t', "Pause status : ", pauseStatus);

            let oldGotchiFarmyVault = await oldBannerDistribution.gotchiFarmyVault();
            expect(oldGotchiFarmyVault).to.equal(gotchiFarmyVault);
            console.log('\t', "Actual gotchiFarmyVault address : ", oldGotchiFarmyVault);

            let oldArtist = await oldBannerDistribution.artist();
            expect(oldArtist).to.equal(artist);
            console.log('\t', "Actual artist address : ", oldArtist);

            let oldPercentage = await oldBannerDistribution.percentageArtist();
            expect(oldPercentage).to.equal(percentageArtist);
            console.log('\t', "Actual artist percentage : ", oldPercentage, "or ", oldPercentage / 100, "%");

            let oldId = await oldBannerDistribution.id();
            expect(oldId).to.equal(0);
            console.log('\t', "Actual id : ", oldId);
        });
    });

    describe("Test owner", function () {
        it('To check everything about the owner ', async function () {
            const [owner, newOwner] = await ethers.getSigners();

            expect(await oldBannerDistribution.owner()).to.equal(owner.address);
            console.log('\t', " 🧑‍🏫 Owner Address: ", owner.address);

            await oldBannerDistribution.transferOwnership(newOwner.address);
            expect(await oldBannerDistribution.owner()).to.equal(newOwner.address);
            console.log('\t', " 🧑‍🏫 New owner Address: ", newOwner.address);

        });
    });

    describe("💵 updatePrice(uint256 newPrice)", function () {
        it("Update price only the owner...", async function () {
            const [owner, nonOwner] = await ethers.getSigners();

            let oldPrice = await oldBannerDistribution.price();
            expect(oldPrice).to.equal(ethers.utils.parseEther("10"));

            console.log('\t', "📈 Update price as non owner should not authorize ...");
            await expect(oldBannerDistribution.connect(nonOwner).updatePrice(2)).to.be.revertedWith("Ownable: caller is not the owner");


            console.log('\t', "📈 Update price as owner should authorize ...")
            let updatePriceTx = await oldBannerDistribution.connect(owner).updatePrice(2);
            console.log('\t', " 🏷  Update Result: ", updatePriceTx.hash);

            let newPrice = await oldBannerDistribution.price();
            expect(newPrice).to.equal(ethers.BigNumber.from(2));
        });
    });


    describe("⏯ pause() unpause()", function () {
        it("Update pause status only the owner...", async function () {
            const [owner, nonOwner] = await ethers.getSigners();

            let oldPause = await oldBannerDistribution.paused();
            expect(oldPause).to.equal(true);

            console.log('\t', "▶️ Call unpause as non owner should not authorize ...");
            await expect(oldBannerDistribution.connect(nonOwner).unpause()).to.be.revertedWith("Ownable: caller is not the owner");


            console.log('\t', "⏸ Update pause as owner should authorize ...")
            let updatePauseTx = await oldBannerDistribution.connect(owner).unpause();
            console.log('\t', "🏷  Update Pause Tx : ", updatePauseTx.hash);

            let newPause = await oldBannerDistribution.paused();
            expect(newPause).to.equal(false);


            console.log('\t', "⏸️ Call pause as non owner should not authorize ...");
            await expect(oldBannerDistribution.connect(nonOwner).pause()).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("🏦&🎨 changeGotchiFarmyVault(address) changeArtist(address)", function () {
        it("Update gotchiVault and artist status only the owner...", async function () {
            const [owner, nonOwner] = await ethers.getSigners();

            console.log('\t', "▶️ Test actual GotchiFarmyVault and change as non owner...");
            let oldGotchiFarmyVault = await oldBannerDistribution.gotchiFarmyVault();
            expect(oldGotchiFarmyVault).to.equal(gotchiFarmyVault);
            await expect(oldBannerDistribution.connect(nonOwner).changeGotchiFarmyVault(nonOwner.address)).to.be.revertedWith("Ownable: caller is not the owner");
            console.log("\t", "✅ Test passed !");

            console.log('\t', "▶️ Test to change GotchiFarmyVault address...");
            await oldBannerDistribution.connect(owner).changeGotchiFarmyVault(nonOwner.address)
            let newGotchiFarmyVault = await oldBannerDistribution.gotchiFarmyVault();
            expect(newGotchiFarmyVault).to.equal(nonOwner.address)
            console.log("\t", "✅ Test passed !");

            console.log('\t', "▶️ Test actual Artist and change as non owner...");
            let oldArtist = await oldBannerDistribution.artist();
            expect(oldArtist).to.equal(artist);
            await expect(oldBannerDistribution.connect(nonOwner).changeArtist(nonOwner.address)).to.be.revertedWith("Ownable: caller is not the owner");
            console.log("\t", "✅ Test passed !");

            console.log('\t', "▶️ Test to change Artist address...");
            await oldBannerDistribution.connect(owner).changeArtist(nonOwner.address)
            let newArtist = await oldBannerDistribution.artist();
            expect(newArtist).to.equal(nonOwner.address)
            console.log("\t", "✅ Test passed !");
        });
    });


    describe("🪙🔢 changePercentageArtist(uint96) changeId(uint256)", function () {
        it("Update percentageArtist and id onlyOwner...", async function () {
            const [owner, nonOwner] = await ethers.getSigners();

            console.log('\t', "▶️ Test actual percentageArtist and change as non owner...");
            let oldPercentage = await oldBannerDistribution.percentageArtist();
            expect(oldPercentage).to.equal(percentageArtist);
            await expect(oldBannerDistribution.connect(nonOwner).changePercentageArtist(2000)).to.be.revertedWith("Ownable: caller is not the owner");
            console.log("\t", "✅ Test passed !");

            console.log('\t', "▶️ Test to change percentageArtist address and test limit < 10000...");
            await expect(oldBannerDistribution.connect(owner).changePercentageArtist(10001)).to.be.revertedWith("OLDBANNER: Percentage artist must be less than 10001 (100.01%)");
            await oldBannerDistribution.connect(owner).changePercentageArtist(2000); // 20%
            let newPercentageArtist = await oldBannerDistribution.percentageArtist();
            expect(newPercentageArtist).to.equal(2000);
            console.log("\t", "✅ Test passed !");

            console.log('\t', "▶️ Test actual id and change as non owner...");
            let oldId = await oldBannerDistribution.id();
            expect(oldId).to.equal(0);
            await expect(oldBannerDistribution.connect(nonOwner).changeId(100)).to.be.revertedWith("Ownable: caller is not the owner");
            console.log("\t", "✅ Test passed !");

            console.log('\t', "▶️ Test to change id...");
            await expect(oldBannerDistribution.connect(owner).changeId(0)).to.be.revertedWith("OLDBANNER: ID must be greater than 0");
            await oldBannerDistribution.connect(owner).changeId(10);
            let newId = await oldBannerDistribution.id();
            expect(newId).to.equal(10);
            console.log("\t", "✅ Test passed !");
        });
    });


    describe("🏳 ditribution(uint256, uint256) test require", function () {
        it("Test the require()...", async function () {
            const [owner] = await ethers.getSigners();
            let oldBannerId = "60626711385683478859139410508102520275389626460571300415968402737270945218660";
            const openseaContract = new ethers.Contract("0x2953399124f0cbb46d2cbacd8a89cf0599974963", openseaContractAbi);
            const ghstContract = new ethers.Contract("0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7", ghstContractAbi);

            console.log('\t', "▶️ GotchiFarmy send old banner to the contract...");
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [gotchiFarmyWalletAddress],
            });
            let gotchiFarmyAccount = await ethers.getSigner(gotchiFarmyWalletAddress);

            let gotchiFarmyOldBannerBalance = await openseaContract.connect(gotchiFarmyAccount).balanceOf(gotchiFarmyAccount.address, oldBannerId);
            console.log('\t', "🏳 GotchiFarmy old banner balance : ", gotchiFarmyOldBannerBalance.toString());
            let contractOldBannerBalance = await openseaContract.connect(gotchiFarmyAccount).balanceOf(oldBannerDistribution.address, oldBannerId);
            console.log('\t', "🏳 Contract old banner balance : ", contractOldBannerBalance.toString());

            await openseaContract.connect(gotchiFarmyAccount).safeTransferFrom(gotchiFarmyAccount.address, oldBannerDistribution.address, oldBannerId, 1, "0x");
            let newContractOldBannerBalance = await openseaContract.connect(gotchiFarmyAccount).balanceOf(oldBannerDistribution.address, oldBannerId);
            let newGotchiFarmyOldBannerBalance = await openseaContract.connect(gotchiFarmyAccount).balanceOf(gotchiFarmyAccount.address, oldBannerId);
            expect(newGotchiFarmyOldBannerBalance).to.equal(gotchiFarmyOldBannerBalance.sub(1));
            console.log('\t', "🏳 GotchiFarmy new banner balance : ", newGotchiFarmyOldBannerBalance.toString());
            expect(newContractOldBannerBalance).to.equal(1);
            console.log('\t', "🏳 Contract new banner balance : ", newContractOldBannerBalance.toString());

            // NelsonRodMar try to buy more old banner than in contract
            console.log('\t', "▶️ NelsonRodMar try to buy more old banner than in contract...");
            await oldBannerDistribution.connect(owner).unpause();
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [nelsonRodMarWalletAddress],
            });
            let nelsonRodMarAccount = await ethers.getSigner(nelsonRodMarWalletAddress);
            await ghstContract.connect(nelsonRodMarAccount).approve(oldBannerDistribution.address, ethers.utils.parseEther('20'));
            await expect(oldBannerDistribution.connect(nelsonRodMarAccount).distribution(2, ethers.utils.parseEther('20'))).to.be.revertedWith("ERC1155: insufficient balance for transfer");
            console.log("\t", "✅ Test passed !");

            // NelsonRodMar try to buy old banner with 0 price
            console.log('\t', "▶️ NelsonRodMar try to buy old banner with 0 GHST...");
            await expect(oldBannerDistribution.connect(nelsonRodMarAccount).distribution(1, 0)).to.be.revertedWith("OLDBANNER: Not enough GHST");
            console.log("\t", "✅ Test passed !");

            // NelsonRodMar try to buy old banner with 0 quantity
            console.log('\t', "▶️ NelsonRodMar try to buy 0 old banner...");
            await expect(oldBannerDistribution.connect(nelsonRodMarAccount).distribution(0, price)).to.be.revertedWith("OLDBANNER: Amount must be greater than 0");
            console.log("\t", "✅ Test passed !");
        });
    });


    describe("🏳 ditribution(uint256, uint256)", function () {
        it("Try to buy one banner...", async function () {
            const [owner] = await ethers.getSigners();
            let oldBannerId = "60626711385683478859139410508102520275389626460571300415968402737270945218660";
            const openseaContract = new ethers.Contract("0x2953399124f0cbb46d2cbacd8a89cf0599974963", openseaContractAbi);
            const ghstContract = new ethers.Contract("0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7", ghstContractAbi);

            console.log('\t', "▶️ GotchiFarmy send old banner to the contract...");
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [gotchiFarmyWalletAddress],
            });
            let gotchiFarmyAccount = await ethers.getSigner(gotchiFarmyWalletAddress);

            let gotchiFarmyOldBannerBalance = await openseaContract.connect(gotchiFarmyAccount).balanceOf(gotchiFarmyAccount.address, oldBannerId);
            console.log('\t', "🏳 GotchiFarmy old banner balance : ", gotchiFarmyOldBannerBalance.toString());
            await openseaContract.connect(gotchiFarmyAccount).safeTransferFrom(gotchiFarmyAccount.address, oldBannerDistribution.address, oldBannerId, gotchiFarmyOldBannerBalance, "0x");
            let oldBannerDistributionOldBannerBalance = await openseaContract.connect(gotchiFarmyAccount).balanceOf(oldBannerDistribution.address, oldBannerId);
            let newGotchiFarmyOldBannerBalance = await openseaContract.connect(gotchiFarmyAccount).balanceOf(gotchiFarmyAccount.address, oldBannerId);
            expect(oldBannerDistributionOldBannerBalance).to.equal(gotchiFarmyOldBannerBalance);
            expect(newGotchiFarmyOldBannerBalance).to.equal(0);
            console.log('\t', "🏳 Contract old banner balance : ", oldBannerDistributionOldBannerBalance.toString());
            console.log('\t', "🏳 GotchiFarmy old banner balance : ", newGotchiFarmyOldBannerBalance.toString());
            console.log("\t", "✅ Test passed !");

            // Unpause contract
            await oldBannerDistribution.connect(owner).unpause();
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [nelsonRodMarWalletAddress],
            });

            let nelsonRodMarAccount = await ethers.getSigner(nelsonRodMarWalletAddress);
            let gotchiVaultAccount = await ethers.getSigner(gotchiFarmyVault);
            let artistAccount = await ethers.getSigner(artist);

            console.log('\t', "▶️ NelsonRodMar account buy an old banner...");
            // Balance before
            let nelsonRodMarBalanceBefore = await ghstContract.connect(nelsonRodMarAccount).balanceOf(ethers.utils.getAddress(nelsonRodMarAccount.address));
            let gotchiVaultBalanceBefore = await ghstContract.connect(gotchiVaultAccount).balanceOf(ethers.utils.getAddress(gotchiVaultAccount.address));
            let artistBalanceBefore = await ghstContract.connect(artistAccount).balanceOf(ethers.utils.getAddress(artistAccount.address));
            console.log('\t', "🏦 GHST NelsonRodMar Balance: ", ethers.utils.formatEther(nelsonRodMarBalanceBefore));
            console.log('\t', "🏦 GHST GotchiFarmyVault Balance: ", ethers.utils.formatEther(gotchiVaultBalanceBefore));
            console.log('\t', "🏦 GHST Artist Balance: ", ethers.utils.formatEther(artistBalanceBefore));
            let nelsonRodMarOldBannerBalanceBefore = await openseaContract.connect(nelsonRodMarAccount).balanceOf(nelsonRodMarAccount.address, oldBannerId);
            expect(nelsonRodMarOldBannerBalanceBefore).to.equal(0);
            console.log('\t', "🏳 NelsonRodMar old banner balance : ", nelsonRodMarOldBannerBalanceBefore.toString());

            // Owner set old banner id
            await oldBannerDistribution.connect(owner).changeId(oldBannerId);

            // NelsonRodMar buy an old banner
            await ghstContract.connect(nelsonRodMarAccount).approve(oldBannerDistribution.address, price);
            await oldBannerDistribution.connect(nelsonRodMarAccount).distribution(1, price);

            // Balance after
            let nelsonRodMarBalanceAfter = await ghstContract.connect(nelsonRodMarAccount).balanceOf(ethers.utils.getAddress(nelsonRodMarAccount.address));
            let gotchiVaultBalanceAfter = await ghstContract.connect(gotchiVaultAccount).balanceOf(ethers.utils.getAddress(gotchiVaultAccount.address));
            let artistBalanceAfter = await ghstContract.connect(artistAccount).balanceOf(ethers.utils.getAddress(artistAccount.address));
            expect(nelsonRodMarBalanceAfter).to.equal(nelsonRodMarBalanceBefore.sub(price));
            console.log('\t', "🏦 GHST NelsonRodMar Balance: ", ethers.utils.formatEther(nelsonRodMarBalanceAfter));
            let nelsonRodMarOldBannerBalanceAfter = await openseaContract.connect(nelsonRodMarAccount).balanceOf(nelsonRodMarAccount.address, oldBannerId);
            expect(nelsonRodMarOldBannerBalanceAfter).to.equal(1);
            console.log('\t', "🏳 NelsonRodMar new banner balance : ", nelsonRodMarOldBannerBalanceAfter.toString());
            expect(gotchiVaultBalanceAfter).to.equal(gotchiVaultBalanceBefore.add(price.div(10000).mul(10000 - percentageArtist)));
            console.log('\t', "🏦 GHST GotchiFarmyVault Balance: ", ethers.utils.formatEther(gotchiVaultBalanceAfter));
            expect(artistBalanceAfter).to.equal(artistBalanceBefore.add(price.div(10000).mul(percentageArtist)));
            console.log('\t', "🏦 GHST Artist Balance: ", ethers.utils.formatEther(artistBalanceAfter));
            console.log("\t", "✅ Test passed !");
        });
    });
});