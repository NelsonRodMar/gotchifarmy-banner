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

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

interface GHST {
    function transfer(address dst, uint amt) external returns (bool);

    function transferFrom(address src, address dst, uint amt) external returns (bool);

    function balanceOf(address src) external view returns (uint);
}

contract GotchiFarmyBanner is ERC1155Upgradeable, ERC2981Upgradeable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {

    string public name;
    string public symbol;
    uint256 public price;
    uint256 public id;

    address public gotchiFarmyVault;
    address public artist;
    uint96 public percentageArtist; // 15%

    GHST public ghst;
    address  private constant GHST_CONTRACT = 0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7;

    event NewMint(address indexed _to, uint256 indexed _id, uint256 _amount);

    function initialize() public initializer {
        __ERC1155_init("");
        __ERC2981_init();
        __Ownable_init();
        _pause();
        price = 10 ether;
        id = 5;
        symbol = "BANNER";
        name = "Gotchi Farmy Banner";
        ghst = GHST(GHST_CONTRACT);
        percentageArtist = 1500; // 15%
        _setDefaultRoyalty(gotchiFarmyVault, 1000); // 10%
        gotchiFarmyVault = 0x53a75d41bfc6b5F9E4D4F9769eb12CF58904F37a;
        artist = 0x860980abaD6267C6dd35D8B1C1B14Fa6741DB3A6;
    }

    // @notice The function to mint new banner, free for admin only and 5 matic for user
    function mint(uint256 amount, uint256 _amountInGhst) public whenNotPaused nonReentrant {
        require(amount > 0, "BANNER: You need to buy at least one banner");
        require(msg.sender == owner() || _amountInGhst >= price * amount, "BANNER: Not enough GHST or not admin");
        // Transfer the GHST if not admin
        if (msg.sender != owner()) {
            uint256 _artistAmount = (_amountInGhst / 10000) * percentageArtist;
            uint256 _vaultAmount = _amountInGhst - _artistAmount;

            // Transfer the GHST to artist
            bool successTransferArstist = ghst.transferFrom(msg.sender, artist, _artistAmount);
            require(successTransferArstist, "BANNER: GHST transfer to artist failed");

            // Transfer the GHST to vault
            bool successTransferGotchiFarmyVault = ghst.transferFrom(msg.sender, gotchiFarmyVault, _vaultAmount);
            require(successTransferGotchiFarmyVault, "BANNER: GHST transfer to vault failed");
        }

        _mint(msg.sender, id, amount, "");

        emit NewMint(msg.sender, id, amount);
    }


    /* //////////////////////////////////////////////////////////////
                            ONLY OWNER FUNCTIONS
    ////////////////////////////////////////////////////////////// */

    // @notice The function to change the mint price, only admin
    function updatePrice(uint256 newPrice) external onlyOwner {
        price = newPrice;
    }

    // @notice Let the owner pause the contract
    function pause() external onlyOwner whenNotPaused {
        _pause();
    }

    // @notice Let the owner unpause the contract
    function unpause() external onlyOwner whenPaused {
        _unpause();
    }

    // @notice The function to change the ID of the banner minted
    function changeId(uint256 _id) external onlyOwner {
        require(_id > 0, "BANNER: ID must be greater than 0");
        id = _id;
    }

    // @notice The function to change the gotchi farmy vault address
    function changeGotchiFarmyVault(address _gotchiFarmyVault) external onlyOwner {
        require(_gotchiFarmyVault != address(0), "BANNER: Invalid address");
        gotchiFarmyVault = _gotchiFarmyVault;
    }

    // @notice The function to change the artist address
    function changeArtist(address _artist) external onlyOwner {
        require(_artist != address(0), "BANNER: Invalid address");
        artist = _artist;
    }

    // @notice  The function to change the percentage of the artist
    function changePercentageArtist(uint256 _percentageArtist) external onlyOwner {
        require(_percentageArtist <= _feeDenominator(), "BANNER: Percentage artist must be less than 10001 (100.01%)");
        percentageArtist = uint96(_percentageArtist);
    }

    // @notice Update the royalties
    function updateRoyalties(uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(gotchiFarmyVault, feeNumerator);
    }

    // @notice Update the royalties
    function updateTokenRoyalties(uint256 _tokenId, uint96 feeNumerator) public onlyOwner {
        _setTokenRoyalty(_tokenId, gotchiFarmyVault, feeNumerator);
    }

    // @notice The function to mint multiple NFT
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts) public onlyOwner whenNotPaused {
        _mintBatch(to, ids, amounts, "");
    }

    // @notice The function to set the URI
    function setUri(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    // @notice The function to burn NFT
    function burn(address _account, uint256 _id, uint256 _amount) external onlyOwner {
        _burn(_account, _id, _amount);
    }

    // @notice THe function to burn multiple NFT
    function burnBatch(address _from, uint256[] memory _ids, uint256[] memory _amounts) external onlyOwner {
        _burnBatch(_from, _ids, _amounts);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155Upgradeable, ERC2981Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
