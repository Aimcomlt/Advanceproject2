// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ReaderLib
/// @notice Pure helpers for reader engagement features such as highlights and consensus.
library ReaderLib {
    /// @notice Compute the canonical hash for a highlight tied to a given book token.
    /// @param bookId Identifier of the book/edition the highlight references.
    /// @param highlightText Canonicalised highlight text string.
    /// @return hash keccak256 hash representing the highlight record.
    function hashHighlight(uint256 bookId, string memory highlightText) internal pure returns (bytes32 hash) {
        hash = keccak256(abi.encodePacked("HIGHLIGHT", bookId, highlightText));
    }

    /// @notice Compute the canonical hash for a comment tied to a given book token.
    /// @param bookId Identifier of the book/edition the comment references.
    /// @param commentText Canonicalised comment text string.
    /// @return hash keccak256 hash representing the comment record.
    function hashComment(uint256 bookId, string memory commentText) internal pure returns (bytes32 hash) {
        hash = keccak256(abi.encodePacked("COMMENT", bookId, commentText));
    }

    /// @notice Determine whether the consensus threshold has been reached for a record.
    /// @param approvals Number of unique approvals recorded.
    /// @param threshold Minimum number of approvals required for consensus.
    /// @return True when consensus has been achieved.
    function hasReachedConsensus(uint256 approvals, uint256 threshold) internal pure returns (bool) {
        return threshold != 0 && approvals >= threshold;
    }
}
