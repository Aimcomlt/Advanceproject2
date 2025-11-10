// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IProposalBeforeExecuteHook, IProposalAfterExecuteHook} from "../interfaces/IProposalExecutionHooks.sol";

/// @title ProposalExecutionHookMock
/// @notice Testing helper recording invocations of execution hooks.
contract ProposalExecutionHookMock is IProposalBeforeExecuteHook, IProposalAfterExecuteHook {
    uint256 public beforeCount;
    uint256 public afterCount;
    uint256 public lastBeforeProposalId;
    uint256 public lastAfterProposalId;
    bytes32 public lastBeforeDescriptionHash;
    bytes32 public lastAfterDescriptionHash;

    function beforeProposalExecute(
        uint256 proposalId,
        address[] calldata,
        uint256[] calldata,
        bytes[] calldata,
        bytes32 descriptionHash
    ) external override {
        beforeCount += 1;
        lastBeforeProposalId = proposalId;
        lastBeforeDescriptionHash = descriptionHash;
    }

    function afterProposalExecute(
        uint256 proposalId,
        address[] calldata,
        uint256[] calldata,
        bytes[] calldata,
        bytes32 descriptionHash
    ) external override {
        afterCount += 1;
        lastAfterProposalId = proposalId;
        lastAfterDescriptionHash = descriptionHash;
    }
}
