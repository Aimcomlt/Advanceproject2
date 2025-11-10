// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title FeedbackNFTMock
/// @notice Simple mock implementing the minimal interface required by ConcessionChain tests.
contract FeedbackNFTMock {
    uint256 private _nextTokenId = 1;

    event FeedbackMinted(address indexed to, bytes32 indexed recordHash, uint256 tokenId);

    function mintFeedback(address to, bytes32 recordHash) external returns (uint256 tokenId) {
        require(to != address(0), "FeedbackNFTMock: invalid recipient");

        tokenId = _nextTokenId++;
        emit FeedbackMinted(to, recordHash, tokenId);
    }
}
