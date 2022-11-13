const {expect} = require('chai');
const {ethers} = require("hardhat");
const ghstContractAbi = require("./abi/ghst.json");

let GotchiFarmyBanner, gotchiFarmyBanner, percentageArtist, mintPrice, gotchiFarmyVault, artist, id, nelsonRodMarWalletAddress, ghstContractAddress;

// Start test block
describe('GotchiFarmyBanner (proxy)', function () {
    // Deploy the contract
    beforeEach(async function () {
        GotchiFarmyBanner = await ethers.getContractFactory("GotchiFarmyBanner");
        gotchiFarmyBanner = await upgrades.deployProxy(GotchiFarmyBanner);
        gotchiFarmyVault = '0x53a75d41bfc6b5F9E4D4F9769eb12CF58904F37a';
        artist = '0x860980abaD6267C6dd35D8B1C1B14Fa6741DB3A6';
        percentageArtist = 1500;
        mintPrice = ethers.utils.parseEther("10");
        id = 5;
        nelsonRodMarWalletAddress = "0x770569f85346B971114e11E4Bb5F7aC776673469";
        ghstContractAddress = "0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7";
    });

    describe("Testing init value", function () {
        it("Should get every value as init", async function () {
            let oldMintPrice = await gotchiFarmyBanner.price();
            expect(oldMintPrice).to.equal(mintPrice);
            console.log('\t', "Mint price : ", ethers.utils.formatEther(oldMintPrice));

            let tokenSymbol = await gotchiFarmyBanner.symbol();
            expect(tokenSymbol).to.equal("GFA");
            console.log('\t', "Token Symbol : ", tokenSymbol);

            let tokenName = await gotchiFarmyBanner.name();
            expect(tokenName).to.equal("Gotchi Farmy Banner");
            console.log('\t', "Token name : ", tokenName);

            let pauseStatus = await gotchiFarmyBanner.paused();
            expect(pauseStatus).to.equal(true);
            console.log('\t', "Pause status : ", pauseStatus);

            let oldGotchiFarmyVault = await gotchiFarmyBanner.gotchiFarmyVault();
            expect(oldGotchiFarmyVault).to.equal(gotchiFarmyVault);
            console.log('\t', "Actual gotchiFarmyVault address : ", oldGotchiFarmyVault);

            let oldArtist = await gotchiFarmyBanner.artist();
            expect(oldArtist).to.equal(artist);
            console.log('\t', "Actual artist address : ", oldArtist);


            let oldPercentage = await gotchiFarmyBanner.percentageArtist();
            expect(oldPercentage).to.equal(percentageArtist);
            console.log('\t', "Actual artist percentage : ", oldPercentage, "or ", oldPercentage / 100, "%");


            let oldId = await gotchiFarmyBanner.id();
            expect(oldId).to.equal(id);
            console.log('\t', "Actual id : ", oldId);
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


    describe("💵 updatePrice(uint256 newPrice)", function () {
        it("Update price only the owner...", async function () {
            const [owner, nonOwner] = await ethers.getSigners();

            let oldPrice = await gotchiFarmyBanner.price();
            expect(oldPrice).to.equal(ethers.utils.parseEther("10"));

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

    describe("🏦&🎨 changeGotchiFarmyVault(address) changeArtist(address)", function () {
        it("Update gotchiVault and artist status only the owner...", async function () {
            const [owner, nonOwner] = await ethers.getSigners();

            console.log('\t', "▶️ Test to change as non owner...");
            await expect(gotchiFarmyBanner.connect(nonOwner).changeGotchiFarmyVault(nonOwner.address)).to.be.revertedWith("Ownable: caller is not the owner");
            await expect(gotchiFarmyBanner.connect(nonOwner).changeArtist(nonOwner.address)).to.be.revertedWith("Ownable: caller is not the owner");

            console.log('\t', "▶️ Test to change GotchiFarmyVault address...");
            await gotchiFarmyBanner.connect(owner).changeGotchiFarmyVault(nonOwner.address)
            let newGotchiFarmyVault = await gotchiFarmyBanner.gotchiFarmyVault();
            expect(newGotchiFarmyVault).to.equal(nonOwner.address)

            console.log('\t', "▶️ Test to change Artist address...");
            await gotchiFarmyBanner.connect(owner).changeArtist(nonOwner.address)
            let newArtist = await gotchiFarmyBanner.artist();
            expect(newArtist).to.equal(nonOwner.address)
        });
    });


    describe("🪙🔢 changePercentageArtist(uint96) changeId(uint256)", function () {
        it("Update percentageArtist and id onlyOwner...", async function () {
            const [owner, nonOwner] = await ethers.getSigners();

            console.log('\t', "▶️ Test to change as non owner...");
            await expect(gotchiFarmyBanner.connect(nonOwner).changePercentageArtist(2000)).to.be.revertedWith("Ownable: caller is not the owner");
            await expect(gotchiFarmyBanner.connect(nonOwner).changeId(100)).to.be.revertedWith("Ownable: caller is not the owner");

            console.log('\t', "▶️ Test to change percentageArtist address and test limit < 10000...");
            await expect(gotchiFarmyBanner.connect(owner).changePercentageArtist(10001)).to.be.revertedWith("BANNER: Percentage artist must be less than 10001 (100.01%)");
            await gotchiFarmyBanner.connect(owner).changePercentageArtist(2000); // 20%
            let newPercentageArtist = await gotchiFarmyBanner.percentageArtist();
            expect(newPercentageArtist).to.equal(2000);

            console.log('\t', "▶️ Test to change id...");
            await expect(gotchiFarmyBanner.connect(owner).changeId(0)).to.be.revertedWith("BANNER: ID must be greater than 0");
            await gotchiFarmyBanner.connect(owner).changeId(10);
            let newId = await gotchiFarmyBanner.id();
            expect(newId).to.equal(10);
        });
    });

    describe("💵 mint(uint256 id, uint256 amount)", function () {
        it("Free for the owner paid for the other...", async function () {
            const [owner] = await ethers.getSigners();
            const ghstContract = new ethers.Contract(ghstContractAddress, ghstContractAbi);

            // Unpause contract
            await gotchiFarmyBanner.connect(owner).unpause();

            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [nelsonRodMarWalletAddress],
            });

            let nelsonRodMarAccount = await ethers.getSigner(nelsonRodMarWalletAddress);
            let gotchiVaultAccount = await ethers.getSigner(gotchiFarmyVault);
            let artistAccount = await ethers.getSigner(artist);

            console.log('\t', "▶️ Test to mint 0 & try with less than required amount...");
            await expect(gotchiFarmyBanner.connect(nelsonRodMarAccount).mint(0, mintPrice)).to.be.revertedWith("BANNER: Amount must be greater than 0");
            await expect(gotchiFarmyBanner.connect(nelsonRodMarAccount).mint(1, mintPrice.sub(1))).to.be.revertedWith("BANNER: Not enough GHST or not admin");
            console.log('\t', "✅️ Test passed");

            // Display all balances before mint
            console.log('\t', "▶️ Test to mint 1 as NelsonRodMar.eth ...");
            let nelsonRodMarBalanceBefore = await ghstContract.connect(nelsonRodMarAccount).balanceOf(ethers.utils.getAddress(nelsonRodMarAccount.address));
            let gotchiVaultBalanceBefore = await ghstContract.connect(gotchiVaultAccount).balanceOf(ethers.utils.getAddress(gotchiVaultAccount.address));
            let artistBalanceBefore = await ghstContract.connect(artistAccount).balanceOf(ethers.utils.getAddress(artistAccount.address));
            console.log('\t', "🏦 GHST NelsonRodMar Balance: ", ethers.utils.formatEther(nelsonRodMarBalanceBefore));
            console.log('\t', "🏦 GHST GotchiFarmyVault Balance: ", ethers.utils.formatEther(gotchiVaultBalanceBefore));
            console.log('\t', "🏦 GHST Artist Balance: ", ethers.utils.formatEther(artistBalanceBefore));

            // Check banner balance before mint
            let actualId = await gotchiFarmyBanner.id();
            let bannerBalanceBeforeMint = await gotchiFarmyBanner.balanceOf(nelsonRodMarAccount.address, actualId);
            expect(bannerBalanceBeforeMint).to.equal(0);

            // Mint 1 banner
            console.log('\t', "🛒 Mint 1 banner...");
            await ghstContract.connect(nelsonRodMarAccount).approve(gotchiFarmyBanner.address, mintPrice);
            await gotchiFarmyBanner.connect(nelsonRodMarAccount).mint(1, mintPrice);
            let bannerBalanceAfterMint = await gotchiFarmyBanner.balanceOf(nelsonRodMarAccount.address, actualId);
            expect(bannerBalanceAfterMint).to.equal(1);
            console.log('\t', "🏦 Banner NelsonRodMar Balance: ", bannerBalanceAfterMint);

            // Display all balances after mint
            let nelsonRodMarBalanceAfter = await ghstContract.connect(nelsonRodMarAccount).balanceOf(ethers.utils.getAddress(nelsonRodMarAccount.address));
            expect(nelsonRodMarBalanceAfter).to.equal(nelsonRodMarBalanceBefore.sub(mintPrice));
            console.log('\t', "🏦 GHST NelsonRodMar Balance: ", ethers.utils.formatEther(nelsonRodMarBalanceAfter));
            let gotchiVaultBalanceAfter = await ghstContract.connect(gotchiVaultAccount).balanceOf(ethers.utils.getAddress(gotchiVaultAccount.address));
            expect(gotchiVaultBalanceAfter).to.equal(gotchiVaultBalanceBefore.add(mintPrice.div(10000).mul(10000 - percentageArtist)));
            console.log('\t', "🏦 GHST GotchiFarmyVault Balance: ", ethers.utils.formatEther(gotchiVaultBalanceAfter));
            let artistBalanceAfter = await ghstContract.connect(artistAccount).balanceOf(ethers.utils.getAddress(artistAccount.address));
            expect(artistBalanceAfter).to.equal(artistBalanceBefore.add(mintPrice.div(10000).mul(percentageArtist)));
            console.log('\t', "🏦 GHST Artist Balance: ", ethers.utils.formatEther(artistBalanceAfter));
            console.log('\t', "✅️ Test passed");

            console.log('\t', "▶️ Test to mint 1 as owner (should be free)...");
            let ownerBalanceBefore = await gotchiFarmyBanner.connect(owner).balanceOf(owner.address, actualId);
            expect(ownerBalanceBefore).to.equal(0);
            await gotchiFarmyBanner.connect(owner).mint(1, 0);
            let ownerBalanceAfter = await gotchiFarmyBanner.connect(owner).balanceOf(owner.address, actualId);
            expect(ownerBalanceAfter).to.equal(1);
            console.log('\t', "🏦 Banner Owner Balance: ", ownerBalanceAfter);
            console.log('\t', "✅️ Test passed");
        });
    });


    describe("🪙️ withdrawERC20Stuck(address)", function () {
        it("Try withdrawERC20Stuck function...", async function () {
            const [owner, stranger] = await ethers.getSigners();
            let nbGhst = 4;
            const ghstContract = new ethers.Contract(ghstContractAddress, ghstContractAbi);

            console.log(ghstContract.address);

            // Testing require function
            console.log('\t', "▶️ Testing require condition...");
            await expect(gotchiFarmyBanner.connect(stranger).withdrawERC20Stuck(ghstContract.address)).to.revertedWith("Ownable: caller is not the owner");
            await expect(gotchiFarmyBanner.connect(owner).withdrawERC20Stuck(ethers.constants.AddressZero)).to.revertedWith("BANNER: Invalid token address");
            await expect(gotchiFarmyBanner.connect(owner).withdrawERC20Stuck(ghstContract.address)).to.revertedWith("BANNER: No token to withdraw");
            console.log("\t", "✅ Test passed !");


            console.log('\t', "📤️️ NelsonRodMar send GHST to the contract...");
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [nelsonRodMarWalletAddress],
            });
            let nelsonRodMarAccount = await ethers.getSigner(nelsonRodMarWalletAddress);
            await ghstContract.connect(nelsonRodMarAccount).transfer(gotchiFarmyBanner.address, ethers.utils.parseEther(nbGhst.toString()));
            let oldContractBalance = await ghstContract.connect(owner).balanceOf(gotchiFarmyBanner.address);
            let oldOwnerBalance = await ghstContract.connect(owner).balanceOf(owner.address);
            expect(oldContractBalance.toString()).to.equal(ethers.utils.parseEther(nbGhst.toString()));
            console.log('\t', "🏦 Contract GHST balance at the begining : ", ethers.utils.formatEther(oldContractBalance));
            console.log('\t', "🏦 Owner GHST balance at the begining : ", ethers.utils.formatEther(oldOwnerBalance));

            console.log('\t', "▶️ Withdraw GHST...");
            await gotchiFarmyBanner.connect(owner).withdrawERC20Stuck(ghstContract.address);
            let newContractBalance = await ghstContract.connect(owner).balanceOf(gotchiFarmyBanner.address);
            let newOwnerBalance = await ghstContract.connect(owner).balanceOf(owner.address);
            expect(newContractBalance).to.equal(0);
            console.log('\t', "🏦 Contract GHST balance at the end : ", ethers.utils.formatEther(newContractBalance));
            expect(newOwnerBalance.toString()).to.equal(ethers.utils.parseEther(nbGhst.toString()));
            console.log('\t', "🏦 Owner GHST balance at the end : ", ethers.utils.formatEther(newOwnerBalance));
            console.log("\t", "✅ Test passed !");
        });
    });

    describe("🪙️ upgradeProxy(proxy, contract)", function () {
        
        it("Should execute a new function once the contract is upgraded", async () => {
          const upgradeableV2Factory = await ethers.getContractFactory(
            "GotchiFarmyBannerV2",
            owner
          );
        
          await upgrades.upgradeProxy(gotchiFarmyBanner.address, upgradeableV2Factory);
          gotchiFarmyBannerV2 = upgradeableV2Factory.attach(
            gotchiFarmyBanner.address
          ) as GotchiFarmyBannerV2;
          expect(await gotchiFarmyBannerV2.version()).to.eq(0);
        });

        it("Should get the same stored values after the contract is upgraded", async () => {
            let newPrice = await gotchiFarmyBannerV2.price();
            expect(newPrice).to.equal(ethers.utils.parseEther("10"));
        });
    });
});
