//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address dst, uint amt) external returns (bool);

    function transferFrom(address src, address dst, uint amt) external returns (bool);

    function balanceOf(address src) external view returns (uint);
}
