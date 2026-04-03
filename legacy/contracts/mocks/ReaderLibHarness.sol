// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReaderLib} from "../libraries/ReaderLib.sol";

/// @title ReaderLibHarness
/// @notice Exposes ReaderLib helpers for unit testing.
contract ReaderLibHarness {
    function hashHighlight(uint256 bookId, string memory highlightText) external pure returns (bytes32) {
        return ReaderLib.hashHighlight(bookId, highlightText);
    }

    function hashComment(uint256 bookId, string memory commentText) external pure returns (bytes32) {
        return ReaderLib.hashComment(bookId, commentText);
    }

    function hasReachedConsensus(uint256 approvals, uint256 threshold) external pure returns (bool) {
        return ReaderLib.hasReachedConsensus(approvals, threshold);
    }
}
