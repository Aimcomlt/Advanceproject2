// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AuthorLib} from "../libraries/AuthorLib.sol";

/// @title AuthorLibHarness
/// @notice Exposes AuthorLib helpers for unit testing.
contract AuthorLibHarness {
    function complementaryShare(uint16 authorBps) external pure returns (uint16) {
        return AuthorLib.complementaryShare(authorBps);
    }

    function isValidSplit(uint16 authorBps, uint16 treasuryBps) external pure returns (bool) {
        return AuthorLib.isValidSplit(authorBps, treasuryBps);
    }

    function computeSaleSplit(uint256 mintAmount, uint16 authorBps, uint16 treasuryBps)
        external
        pure
        returns (uint256 authorAmount, uint256 treasuryAmount)
    {
        return AuthorLib.computeSaleSplit(mintAmount, authorBps, treasuryBps);
    }
}
