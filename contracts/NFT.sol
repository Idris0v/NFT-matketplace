 // SPDX-License-Identifier GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    address private immutable _marketplaceAddress;

    constructor(address marketplaceAddress) ERC721("CryptoBurgers", "CBURG") {
        _marketplaceAddress = marketplaceAddress;
    }

    function mintToken(string memory tokenURI) public returns (uint) {
        _tokenIds.increment();
        uint newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        // Approve `operator` to operate on all of `owner` tokens
        setApprovalForAll(_marketplaceAddress, true);
        return newTokenId;
    }
} 