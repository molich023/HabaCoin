// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title HabaCoin Founding Bridge Identity Token
 * @notice Fully on-chain SVG-rendered elite user identity badge.
 */
contract HabaFoundingNFT is ERC721, Ownable {
    using Strings for uint256;
    
    uint256 public nextTokenId;
    mapping(uint256 => uint256) public badgeReputation;

    constructor() ERC721("Haba Founding Bridge", "HFB") Ownable(msg.sender) {}

    function mintBadge(address _winner, uint256 _rep) external onlyOwner {
        uint256 tokenId = nextTokenId++;
        _safeMint(_winner, tokenId);
        badgeReputation[tokenId] = _rep;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        string memory svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">',
            '<rect width="100%" height="100%" fill="#050505"/>',
            '<circle cx="200" cy="200" r="150" fill="none" stroke="#27ae60" stroke-width="4" stroke-dasharray="10 5"/>',
            '<path d="M150,200 C150,160 190,160 200,200 C210,240 250,240 250,200 C250,160 210,160 200,200 C190,240 150,240 150,200 Z" fill="none" stroke="#f1c40f" stroke-width="6" stroke-linecap="round"/>',
            '<text x="50%" y="310" fill="#ffffff" font-family="monospace" font-size="16" font-weight="bold" text-anchor="middle">FOUNDING BRIDGE MEMBERSHIP</text>',
            '<text x="50%" y="340" fill="#27ae60" font-family="monospace" font-size="14" text-anchor="middle">ID PROFILE: #', tokenId.toString(), '</text>',
            '<text x="50%" y="70" fill="#f1c40f" font-family="monospace" font-size="14" text-anchor="middle">REPUTATION SCORE: ', badgeReputation[tokenId].toString(), '</text>',
            '</svg>'
        ));

        string memory json = Base64.encode(bytes(abi.encodePacked(
            '{"name": "Haba Global Founding Badge #', tokenId.toString(), '", ',
            '"description": "Official on-chain proof of priority validation status inside the HabaCoin Ecosystem.", ',
            '"attributes": [{"trait_type": "Reputation Points", "value": ', badgeReputation[tokenId].toString(), '}], ',
            '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
        )));

        return string(abi.encodePacked("data:application/json;base64,", json));
    }
}
