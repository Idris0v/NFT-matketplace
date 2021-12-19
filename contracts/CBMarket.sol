// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CBMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _tokensSold;
    address payable public immutable owner;
    uint public constant listingPrice = 0.045 ether;

    struct MarketToken {
        uint itemId;
        uint tokenId;
        address nftContract;
        address payable seller;
        address payable owner;
        uint price;
        bool sold;
    }

    mapping(uint => MarketToken) private idToMarketToken;

    event MarketTokenMinted(
        uint indexed itemId,
        uint indexed tokenId,
        address indexed nftContract,
        address seller,
        address owner,
        uint price,
        bool sold
    );

    constructor() {
        owner = payable(msg.sender);
    }

    function createMarketItem(address nftContract, uint tokenId, uint price) public payable nonReentrant {
        _tokenIds.increment();
        uint newItemId = _tokenIds.current();

        idToMarketToken[newItemId] = MarketToken(
            newItemId,
            tokenId,
            nftContract,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);

        emit MarketTokenMinted(
            newItemId,
            tokenId,
            nftContract,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    function createMarketSale(address nftContract, uint tokenId) public payable nonReentrant {
        require(msg.value == idToMarketToken[tokenId].price, "Send the asking price in wei");
        // send eth to the seller
        idToMarketToken[tokenId].seller.transfer(msg.value);
        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);
        idToMarketToken[tokenId].owner = payable(msg.sender);
        idToMarketToken[tokenId].sold = true;
        _tokensSold.increment();
        owner.transfer(listingPrice);
    }

    function fetchMarketTokens() external view returns (MarketToken[] memory) {
        uint unsoldTokensCount = _tokenIds.current() - _tokensSold.current();
        MarketToken[] memory items = new MarketToken[](unsoldTokensCount);
        uint itemsIndex = 0;
        for (uint currentId = 1; currentId <= _tokenIds.current(); currentId++) {
            if (!idToMarketToken[currentId].sold) {
                items[itemsIndex] = idToMarketToken[currentId];
                itemsIndex++;
            }
        }
        return items;
    }

    function fetchMyNfts() external view returns (MarketToken[] memory) {
        MarketToken[] memory items = new MarketToken[](5);
        uint itemsIndex = 0;
        for (uint currentId = 1; currentId <= _tokenIds.current(); currentId++) {
            if (idToMarketToken[currentId].owner == msg.sender) {
                items[itemsIndex] = idToMarketToken[currentId];
                itemsIndex++;
            }
        }
        return items;
    }

    function fetchMintedNfts() external view returns (MarketToken[] memory) {
        MarketToken[] memory items = new MarketToken[](5);
        uint itemsIndex = 0;
        for (uint currentId = 1; currentId <= _tokenIds.current(); currentId++) {
            if (idToMarketToken[currentId].seller == msg.sender) {
                items[itemsIndex] = idToMarketToken[currentId];
                itemsIndex++;
            }
        }
        return items;
    }
}