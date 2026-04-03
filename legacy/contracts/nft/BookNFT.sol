// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @title BookNFT
/// @notice ERC721 contract representing limited literary editions with IPFS-hosted
///         metadata and on-chain highlight registries per token.
contract BookNFT is ERC721URIStorage, AccessControl {
    /// @notice Role allowed to mint new book editions.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Struct capturing an on-chain reference to a reader highlight stored on IPFS.
    struct Highlight {
        /// @notice keccak256 hash of the canonicalised highlight text.
        bytes32 highlightHash;
        /// @notice IPFS CID pointing to extended highlight metadata (annotations, context, etc.).
        string metadataCid;
        /// @notice Address that submitted the highlight.
        address recorder;
        /// @notice Timestamp when the highlight was recorded on-chain.
        uint64 recordedAt;
    }

    /// @dev Tracks the next token identifier to assign during minting.
    uint256 private _nextTokenId;

    /// @dev Base URI used for all token metadata (typically an `ipfs://` prefix).
    string private _baseTokenUri;

    /// @dev Storage for token → highlights recorded against that edition.
    mapping(uint256 => Highlight[]) private _tokenHighlights;
    /// @dev Tracks highlight hashes per token to prevent duplicate submissions.
    mapping(uint256 => mapping(bytes32 => bool)) private _highlightSeen;

    /// @notice Emitted whenever the base URI used for metadata is updated.
    event BaseUriUpdated(string newBaseUri);
    /// @notice Emitted when a new edition NFT is minted.
    event EditionMinted(uint256 indexed tokenId, address indexed to, string metadataCid);
    /// @notice Emitted whenever a highlight is recorded for a token.
    event HighlightRecorded(
        uint256 indexed tokenId,
        bytes32 indexed highlightHash,
        string metadataCid,
        address indexed recorder
    );

    /// @param admin Account that receives the default admin and minter roles.
    /// @param initialBaseUri Initial base URI used to resolve token metadata CIDs.
    constructor(address admin, string memory initialBaseUri) ERC721("BookNFT", "BOOK") {
        require(admin != address(0), "BookNFT: admin required");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);

        _baseTokenUri = initialBaseUri;
    }

    /// @notice Update the base URI used for token metadata resolution.
    /// @dev Only callable by accounts with the admin role.
    function setBaseURI(string calldata newBaseUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenUri = newBaseUri;
        emit BaseUriUpdated(newBaseUri);
    }

    /// @notice Mint a new edition NFT to `to` with metadata stored under the provided IPFS CID.
    /// @param to Recipient of the newly minted edition NFT.
    /// @param metadataCid IPFS CID containing the edition's metadata JSON document.
    /// @return tokenId The identifier of the minted NFT.
    function mintEdition(address to, string calldata metadataCid)
        external
        onlyRole(MINTER_ROLE)
        returns (uint256 tokenId)
    {
        require(to != address(0), "BookNFT: invalid recipient");
        require(bytes(metadataCid).length != 0, "BookNFT: metadata required");

        unchecked {
            tokenId = ++_nextTokenId;
        }

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataCid);

        emit EditionMinted(tokenId, to, metadataCid);
    }

    /// @notice Record a highlight for a specific edition NFT.
    /// @dev Only the token owner or an approved operator may record highlights.
    /// @param tokenId The edition receiving the highlight.
    /// @param highlightHash keccak256 hash of the highlight's canonical text.
    /// @param metadataCid IPFS CID with extended highlight metadata (context, references, etc.).
    function recordHighlight(uint256 tokenId, bytes32 highlightHash, string calldata metadataCid)
        external
    {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "BookNFT: not owner or approved");
        require(highlightHash != bytes32(0), "BookNFT: highlight hash required");
        require(bytes(metadataCid).length != 0, "BookNFT: highlight metadata required");

        if (_highlightSeen[tokenId][highlightHash]) {
            revert("BookNFT: highlight already recorded");
        }

        _highlightSeen[tokenId][highlightHash] = true;
        _tokenHighlights[tokenId].push(
            Highlight({
                highlightHash: highlightHash,
                metadataCid: metadataCid,
                recorder: _msgSender(),
                recordedAt: uint64(block.timestamp)
            })
        );

        emit HighlightRecorded(tokenId, highlightHash, metadataCid, _msgSender());
    }

    /// @notice Return the number of highlights recorded for a token.
    function highlightCount(uint256 tokenId) external view returns (uint256) {
        _requireOwned(tokenId);
        return _tokenHighlights[tokenId].length;
    }

    /// @notice Retrieve a highlight stored for `tokenId` at the provided index.
    /// @param tokenId The edition whose highlight is queried.
    /// @param index Index within the highlights array.
    /// @return highlight Stored highlight metadata.
    function highlightAt(uint256 tokenId, uint256 index)
        external
        view
        returns (Highlight memory highlight)
    {
        _requireOwned(tokenId);
        require(index < _tokenHighlights[tokenId].length, "BookNFT: highlight index out of bounds");
        highlight = _tokenHighlights[tokenId][index];
    }

    /// @notice Return all recorded highlights for a token.
    /// @param tokenId The edition being queried.
    /// @return highlights Array of highlight descriptors for the token.
    function highlightsOf(uint256 tokenId)
        external
        view
        returns (Highlight[] memory highlights)
    {
        _requireOwned(tokenId);
        highlights = _tokenHighlights[tokenId];
    }

    /// @inheritdoc AccessControl
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl, ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// @inheritdoc ERC721URIStorage
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /// @inheritdoc ERC721URIStorage
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        delete _tokenHighlights[tokenId];
        super._burn(tokenId);
    }

    /// @inheritdoc ERC721
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenUri;
    }
}
