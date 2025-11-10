// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ProposalTargetMock
/// @notice Simple storage contract to validate proposal execution effects in tests.
contract ProposalTargetMock {
    uint256 public storedValue;

    event ValueStored(uint256 newValue, address indexed caller);

    function storeValue(uint256 newValue) external {
        storedValue = newValue;
        emit ValueStored(newValue, msg.sender);
    }
}
