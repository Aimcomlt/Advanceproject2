// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IProposalBeforeExecuteHook
/// @notice Hook interface invoked prior to performing proposal execution calls.
interface IProposalBeforeExecuteHook {
    function beforeProposalExecute(
        uint256 proposalId,
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata calldatas,
        bytes32 descriptionHash
    ) external;
}

/// @title IProposalAfterExecuteHook
/// @notice Hook interface invoked after proposal calls have been executed.
interface IProposalAfterExecuteHook {
    function afterProposalExecute(
        uint256 proposalId,
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata calldatas,
        bytes32 descriptionHash
    ) external;
}
