// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @title ReaderProfileNFT
/// @notice Soulbound reader identity NFTs represented through a non-transferable ERC721.
contract ReaderProfileNFT is ERC721URIStorage, AccessControl {
    /// @notice Role allowed to issue new reader profiles.
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    /// @dev Error emitted when attempting to transfer or approve a soulbound profile.
    error ReaderProfileNFT__Soulbound();
    /// @dev Error emitted when attempting to issue a second profile for the same reader.
    error ReaderProfileNFT__AlreadyIssued(address reader);
    /// @dev Error emitted when metadata updates are attempted by an unauthorised address.
    error ReaderProfileNFT__NotProfileOwner();

    /// @dev Tracks the next token identifier to assign during minting.
    uint256 private _nextTokenId;

    /// @dev Base URI used for IPFS metadata resolution.
    string private _baseTokenUri;

    /// @dev Mapping tracking which profile token belongs to a reader address.
    mapping(address => uint256) private _profileOf;

    /// @notice Emitted whenever the base URI changes.
    event BaseUriUpdated(string newBaseUri);
    /// @notice Emitted when a new reader profile is minted.
    event ProfileMinted(address indexed reader, uint256 indexed tokenId, string metadataCid);
    /// @notice Emitted when profile metadata is updated.
    event ProfileMetadataUpdated(uint256 indexed tokenId, string metadataCid, address indexed updater);
    /// @notice Emitted when a profile is revoked (burned).
    event ProfileRevoked(uint256 indexed tokenId, address indexed operator);

    /// @param admin Account that receives the default admin and issuer roles.
    /// @param initialBaseUri Base URI prefix (e.g. `ipfs://`) for profile metadata.
    constructor(address admin, string memory initialBaseUri) ERC721("ReaderProfileNFT", "READR") {
        require(admin != address(0), "ReaderProfileNFT: admin required");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ISSUER_ROLE, admin);

        _baseTokenUri = initialBaseUri;
    }

    /// @notice Issue a soulbound reader profile to `reader` with metadata stored on IPFS.
    /// @param reader Address receiving the reader profile.
    /// @param metadataCid IPFS CID pointing to the profile metadata JSON.
    /// @return tokenId Identifier of the newly minted profile token.
    function mintProfile(address reader, string calldata metadataCid)
        external
        onlyRole(ISSUER_ROLE)
        returns (uint256 tokenId)
    {
        require(reader != address(0), "ReaderProfileNFT: invalid reader");
        require(bytes(metadataCid).length != 0, "ReaderProfileNFT: metadata required");

        if (_profileOf[reader] != 0) {
            revert ReaderProfileNFT__AlreadyIssued(reader);
        }

        unchecked {
            tokenId = ++_nextTokenId;
        }

        _safeMint(reader, tokenId);
        _setTokenURI(tokenId, metadataCid);
        _profileOf[reader] = tokenId;

        emit ProfileMinted(reader, tokenId, metadataCid);
    }

    /// @notice Return the profile token associated with `reader` (0 if none).
    function profileOf(address reader) external view returns (uint256) {
        return _profileOf[reader];
    }

    /// @notice Check whether `reader` currently holds a profile token.
    function hasProfile(address reader) external view returns (bool) {
        return _profileOf[reader] != 0;
    }

    /// @notice Update the IPFS metadata CID for a profile.
    /// @param tokenId Profile token being updated.
    /// @param metadataCid New metadata CID to associate with the profile.
    function updateProfileMetadata(uint256 tokenId, string calldata metadataCid) external {
        require(bytes(metadataCid).length != 0, "ReaderProfileNFT: metadata required");

        address owner = ownerOf(tokenId);
        if (_msgSender() != owner && !hasRole(DEFAULT_ADMIN_ROLE, _msgSender())) {
            revert ReaderProfileNFT__NotProfileOwner();
        }

        _setTokenURI(tokenId, metadataCid);
        emit ProfileMetadataUpdated(tokenId, metadataCid, _msgSender());
    }

    /// @notice Burn (revoke) a profile token.
    /// @param tokenId Profile token to burn.
    function burn(uint256 tokenId) external {
        address owner = ownerOf(tokenId);
        if (_msgSender() != owner && !hasRole(DEFAULT_ADMIN_ROLE, _msgSender())) {
            revert ReaderProfileNFT__NotProfileOwner();
        }

        delete _profileOf[owner];
        _burn(tokenId);
        emit ProfileRevoked(tokenId, _msgSender());
    }

    /// @notice Update the base URI prefix for metadata resolution.
    function setBaseURI(string calldata newBaseUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenUri = newBaseUri;
        emit BaseUriUpdated(newBaseUri);
    }

    /// @inheritdoc ERC721
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenUri;
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
        super._burn(tokenId);
    }

    /// @inheritdoc ERC721
    function approve(address, uint256) public pure override {
        revert ReaderProfileNFT__Soulbound();
    }

    /// @inheritdoc ERC721
    function setApprovalForAll(address, bool) public pure override {
        revert ReaderProfileNFT__Soulbound();
    }

    /// @inheritdoc ERC721
    function transferFrom(address, address, uint256) public pure override {
        revert ReaderProfileNFT__Soulbound();
    }

    /// @inheritdoc ERC721
    function safeTransferFrom(address, address, uint256) public pure override {
        revert ReaderProfileNFT__Soulbound();
    }

    /// @inheritdoc ERC721
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert ReaderProfileNFT__Soulbound();
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
}
