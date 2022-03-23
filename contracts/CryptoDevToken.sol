// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevs.sol";

contract CryptoDevToken is ERC20, Ownable {
    // Price of a token
    uint256 public constant tokenPrice = 0.001 ether;
    // Token per nft  owner
    uint256 public constant tokensPerNFT = 10 * 10**18;
    uint256 public constant maxTotalSupply = 10000 * 10**18;
    // Instance of Nft contract
    ICryptoDevs CryptoDevsNFT;
    // keep track of NFT tokenIds which claimed erc20 tokens
    mapping(uint256 => bool) public tokenIdsClaimed;

    constructor(address _cryptoDevsContract) ERC20("Crypto Dev Token", "CD") {
        CryptoDevsNFT = ICryptoDevs(_cryptoDevsContract);
    }

    // mint a specific amount of token
    // price = tokenPrice*amount
    function mint(uint256 amount) public payable {
        uint256 _requiredAmount = tokenPrice * amount;
        require(msg.value >= _requiredAmount, "Ether sent is incorrect");
        uint256 amountWithDecimals = amount * 10**18;
        require(
            (totalSupply() + amountWithDecimals) <= maxTotalSupply,
            "Exceeds the max total supply available."
        );
        _mint(msg.sender, amountWithDecimals);
    }

    // claim tokens based on no.of NFTs held by user
    function claim() public {
        uint256 balance = CryptoDevsNFT.balanceOf(msg.sender);
        require(balance > 0, "You dont own any Crypto Dev NFT's");
        uint256 amount = 0; // based on no.of unclaimed tokens With respect to  nfts
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = CryptoDevsNFT.tokenOfOwnerByIndex(msg.sender, i);
            // checks if claimed based on that Nft tokenId or not
            if (!tokenIdsClaimed[tokenId]) {
                amount += 1;
                tokenIdsClaimed[tokenId] = true;
            }
        }
        require(amount > 0, "You have already claimed all the tokens");
        uint256 totalAmount = amount * tokensPerNFT;
        require(
            (totalSupply() + totalAmount) <= maxTotalSupply,
            "Exceeds the max total supply available."
        );
        _mint(msg.sender, totalAmount);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}
