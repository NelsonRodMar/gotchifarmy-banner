async function main() {
    const proxyAddress = '';

    const GotchiFarmyBannerV2 = await ethers.getContractFactory("GotchiFarmyBannerV2");
    console.log("Preparing upgrade...");
    const gotchiFarmyBannerV2Address = await upgrades.upgradeProxy(proxyAddress, GotchiFarmyBannerV2);
    console.log("GotchiFarmyBannerV2 at:", gotchiFarmyBannerV2Address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
