//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;
/*
   ____       _       _     _   _____
  / ___| ___ | |_ ___| |__ (_) |  ___|_ _ _ __ _ __ ___  _   _
 | |  _ / _ \| __/ __| '_ \| | | |_ / _` | '__| '_ ` _ \| | | |
 | |_| | (_) | || (__| | | | | |  _| (_| | |  | | | | | | |_| |
  \____|\___/ \__\___|_| |_|_| |_|  \__,_|_|  |_| |_| |_|\__, |
                                                         |___/
*/

import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

interface GHST {
    function transfer(address dst, uint amt) external returns (bool);

    function transferFrom(address src, address dst, uint amt) external returns (bool);

    function balanceOf(address src) external view returns (uint);
}

contract OldBannerDistribution is  ERC1155HolderUpgradeable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {

    uint256 public price;
    IERC1155Upgradeable public oldBanner;
    uint256 public id;

    address public gotchiFarmyVault;
    address public artist;
    uint96 public percentageArtist;

    GHST public ghst;
    address  private constant GHST_CONTRACT = 0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7;
    address  private constant OLD_GUILD_BANNER_CONTRACT = 0x2953399124F0cBB46d2CbACD8A89cF0599974963;

    function initialize() public initializer {
        __ERC1155Holder_init();
        __Ownable_init();
        _pause();
        oldBanner = IERC1155Upgradeable(OLD_GUILD_BANNER_CONTRACT);
        ghst = GHST(GHST_CONTRACT);
        price = 10 ether;
        percentageArtist = 1500; // 15%
        gotchiFarmyVault = 0x53a75d41bfc6b5F9E4D4F9769eb12CF58904F37a;
        artist = 0x860980abaD6267C6dd35D8B1C1B14Fa6741DB3A6;
    }

    // @notice The function to buy an old banner
    function distribution(uint256 amount, uint256 _amountInGhst) public whenNotPaused nonReentrant {
        require(amount > 0, "OLDBANNER: Amount must be greater than 0");
        require(_amountInGhst >= price * amount, "OLDBANNER: Not enough GHST");

        uint256 _artistAmount = (_amountInGhst / 10000) * percentageArtist;
        uint256 _vaultAmount = _amountInGhst - _artistAmount;

        // Transfer the GHST to artist
        bool successTransferArtist = ghst.transferFrom(msg.sender, artist, _artistAmount);
        require(successTransferArtist, "OLDBANNER: GHST transfer to artist failed");

        // Transfer the GHST to vault
        bool successTransferGotchiFarmyVault = ghst.transferFrom(msg.sender, gotchiFarmyVault, _vaultAmount);
        require(successTransferGotchiFarmyVault, "OLDBANNER: GHST transfer to vault failed");

        // Transfer the banner to user
        oldBanner.safeTransferFrom(address(this), msg.sender, id, amount, "");
    }


    /* //////////////////////////////////////////////////////////////
                        ONLY OWNER FUNCTIONS
    ////////////////////////////////////////////////////////////// */
    // @notice The function to change the mint price, only admin
    function updatePrice(uint256 newPrice) public onlyOwner {
        price = newPrice;
    }

    // @notice The function to change the gotchi farmy vault address
    function changeGotchiFarmyVault(address _gotchiFarmyVault) public onlyOwner {
        require(_gotchiFarmyVault != address(0), "OLDBANNER: Invalid address");
        gotchiFarmyVault = _gotchiFarmyVault;
    }

    // @notice The function to change the artist address
    function changeArtist(address _artist) public onlyOwner {
        require(_artist != address(0), "OLDBANNER: Invalid address");
        artist = _artist;
    }

    // @notice  The function to change the percentage of the artist
    function changePercentageArtist(uint96 _percentageArtist) public onlyOwner {
        require(_percentageArtist <= 10000, "OLDBANNER: Percentage artist must be less than 10001 (100.01%)");
        percentageArtist = uint96(_percentageArtist);
    }

    // @notice Let the owner pause the contract
    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    // @notice Let the owner unpause the contract
    function unpause() public onlyOwner whenPaused {
        _unpause();
    }

    // @notice The function to change the ID of the banner distributed
    function changeId(uint256 _id) public onlyOwner {
        require(_id > 0, "OLDBANNER: ID must be greater than 0");
        id = _id;
    }
}
