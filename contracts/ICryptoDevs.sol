// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICryptoDevs {
    // get tokenId of owner's token list
    function tokenOfOwnerByIndex(address owner, uint256 index)
        external
        view
        returns (uint256 tokenId);
        // gives no of token owned by address
    function balanceOf(address owner) external view returns(uint256 balance);
}
