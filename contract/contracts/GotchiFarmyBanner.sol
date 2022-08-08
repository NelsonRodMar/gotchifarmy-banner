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
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {Base64} from "./libraries/Base64.sol";


contract GotchiFarmyBanner is ERC1155Upgradeable, OwnableUpgradeable, PausableUpgradeable {

    string public name;
    string public symbol;
    uint256 public price;

    address private constant GOTCHI_FARMY_NFT_CONTRACT = 0x2953399124F0cBB46d2CbACD8A89cF0599974963;
    uint256 private constant GOTCHI_FARMY_NFT_TOKEN_V1 = 60626711385683478859139410508102520275389626460571300415968402695489503363172;
    uint256 private constant GOTCHI_FARMY_NFT_TOKEN_V2 = 60626711385683478859139410508102520275389626460571300415968402698788038246500;
    uint256 private constant GOTCHI_FARMY_NFT_TOKEN_V3 = 60626711385683478859139410508102520275389626460571300415968402737270945218660;

    function initialize() public initializer {
        __ERC1155_init("");
        __Ownable_init();
        _pause();
        price = 5 ether;
        symbol = "BANNER";
        name = "Gotchi Farmy Banner";
    }

    // @notice The function to mint new banner, free for admin only and 5 matic for user
    function mint(uint256 id, uint256 amount) public whenNotPaused payable {
        require(
            msg.sender == owner() ||
            IERC1155Upgradeable(GOTCHI_FARMY_NFT_CONTRACT).balanceOf(msg.sender, GOTCHI_FARMY_NFT_TOKEN_V1) > 0 && msg.value == price * amount ||
            IERC1155Upgradeable(GOTCHI_FARMY_NFT_CONTRACT).balanceOf(msg.sender, GOTCHI_FARMY_NFT_TOKEN_V2) > 0 && msg.value == price * amount ||
            IERC1155Upgradeable(GOTCHI_FARMY_NFT_CONTRACT).balanceOf(msg.sender, GOTCHI_FARMY_NFT_TOKEN_V3) > 0 && msg.value == price * amount,
            "User is not admin or don't possed one of the NFT required or not enought matic"
        );

        _mint(msg.sender, id, amount, "");
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts) public onlyOwner whenNotPaused {
        _mintBatch(to, ids, amounts, "");
    }

    // @notice The function to change the mint price, only admin
    function updatePrice(uint256 newPrice) public onlyOwner {
        price = newPrice;
    }

    // @notice The function to withdraw the balance of the contract by the admin
    function withdraw() public onlyOwner {
        uint _amount = address(this).balance;
        address _to = address(msg.sender);
        (bool success,) = _to.call{value : _amount}("");
        require(success, "Failed to withdraw fund");
    }

    // @notice Let the owner pause the contract
    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    // @notice Let the owner unpause the contract
    function unpause() public onlyOwner whenPaused {
        _unpause();
    }
}
