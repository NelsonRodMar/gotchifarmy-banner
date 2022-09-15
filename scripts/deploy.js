const main = async () => {
    const gnosisSafe = '0x1c14600daeca8852BA559CC8EdB1C383B8825906';

    console.log("Deploying GotchiFarmyBanner, ProxyAdmin, and then Proxy...")
    const GotchiFarmyBanner = await ethers.getContractFactory("GotchiFarmyBanner")
    const gotchiFarmyBanner = await upgrades.deployProxy(GotchiFarmyBanner)
    console.log("GotchiFarmyBanner deployed to:", gotchiFarmyBanner.address)

    console.log("Transferring ownership of ProxyAdmin...");
    await upgrades.admin.transferProxyAdminOwnership(gnosisSafe);
    console.log("Transferred ownership of ProxyAdmin to:", gnosisSafe);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    });