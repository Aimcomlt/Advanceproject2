// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title GovernanceLib
/// @notice Utility helpers shared across governance contracts.
library GovernanceLib {
    /// @notice Basis point denominator used for quorum configuration.
    uint16 internal constant MAX_BPS = 10_000;

    /// @notice Check whether a quorum basis point value is valid.
    /// @param quorumBps Value to validate.
    /// @return True when the value is within the 0 – 10,000 range.
    function isValidQuorumBps(uint16 quorumBps) internal pure returns (bool) {
        return quorumBps <= MAX_BPS;
    }

    /// @notice Compute the number of votes required to satisfy a quorum threshold.
    /// @param totalSupply Total voting power available (AuthorCoin total supply).
    /// @param quorumBps Basis points expressing the quorum.
    /// @return votes Required votes to meet quorum.
    function computeQuorum(uint256 totalSupply, uint16 quorumBps) internal pure returns (uint256 votes) {
        votes = (totalSupply * quorumBps) / MAX_BPS;
    }
}
