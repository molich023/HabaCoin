// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract HabaFoundingNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => uint256) public badgeReputation;

    constructor() ERC721("Haba Founding Bridge", "HFB") Ownable(msg.sender) {}

    function mintBadge(address _winner, uint256 _rep) external onlyOwner {
        uint256 tokenId = nextTokenId++;
        _safeMint(_winner, tokenId);
        badgeReputation[tokenId] = _rep;
    }

    // This function generates the SVG image directly on-chain
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">',
            '<rect width="100%" height="100%" fill="black"/>',
            '<text x="50%" y="50%" fill="gold" font-family="monospace" text-anchor="middle">FOUNDING BRIDGE #',
            Strings.toString(tokenId), '</text></svg>'
        ));
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(abi.encodePacked(
            '{"name": "Haba Bridge #', Strings.toString(tokenId), '", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
        )))));
    }
}
