// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {GovernanceLib} from "../libraries/GovernanceLib.sol";

/// @title GovernanceLibHarness
/// @notice Exposes GovernanceLib helpers for unit testing.
contract GovernanceLibHarness {
    function isValidQuorumBps(uint16 quorumBps) external pure returns (bool) {
        return GovernanceLib.isValidQuorumBps(quorumBps);
    }

    function computeQuorum(uint256 totalSupply, uint16 quorumBps) external pure returns (uint256) {
        return GovernanceLib.computeQuorum(totalSupply, quorumBps);
    }
}
