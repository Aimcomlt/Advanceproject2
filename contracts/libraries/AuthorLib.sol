// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AuthorLib
/// @notice Helper methods for calculating royalty and treasury splits for authors.
library AuthorLib {
    /// @notice Basis point denominator used for royalty calculations.
    uint16 internal constant MAX_BPS = 10_000;

    /// @dev Error thrown when attempting to derive a complementary share above 100%.
    error AuthorLib__ShareExceedsMax(uint16 shareBps);

    /// @notice Determine whether the provided split adds up to the basis point denominator.
    /// @param authorBps Basis points allocated to the author.
    /// @param treasuryBps Basis points allocated to the treasury.
    /// @return True when the split sums to exactly 10,000 basis points.
    function isValidSplit(uint16 authorBps, uint16 treasuryBps) internal pure returns (bool) {
        return authorBps + treasuryBps == MAX_BPS;
    }

    /// @notice Compute the complementary treasury share for a given author allocation.
    /// @param authorBps Basis points allocated to the author (0 – 10,000).
    /// @return treasuryBps Basis points that should flow to the treasury.
    function complementaryShare(uint16 authorBps) internal pure returns (uint16 treasuryBps) {
        if (authorBps > MAX_BPS) {
            revert AuthorLib__ShareExceedsMax(authorBps);
        }
        treasuryBps = MAX_BPS - authorBps;
    }

    /// @notice Calculate the author and treasury allocations for a proposed mint amount.
    /// @param mintAmount Total number of tokens that will be minted.
    /// @param authorBps Basis points of the mint allocated to the author.
    /// @param treasuryBps Basis points of the mint allocated to the treasury.
    /// @return authorAmount Amount earmarked for the author.
    /// @return treasuryAmount Amount earmarked for the treasury.
    function computeSaleSplit(
        uint256 mintAmount,
        uint16 authorBps,
        uint16 treasuryBps
    ) internal pure returns (uint256 authorAmount, uint256 treasuryAmount) {
        authorAmount = (mintAmount * authorBps) / MAX_BPS;
        treasuryAmount = (mintAmount * treasuryBps) / MAX_BPS;

        uint256 accounted = authorAmount + treasuryAmount;
        if (accounted < mintAmount) {
            unchecked {
                treasuryAmount += mintAmount - accounted;
            }
        }
    }
}
