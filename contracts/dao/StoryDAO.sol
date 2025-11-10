// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovernorSettings} from "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import {GovernorCountingSimple} from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";

import {AuthorCoin} from "../token/AuthorCoin.sol";
import {ReaderProfileNFT} from "../nft/ReaderProfileNFT.sol";
import {IProposalBeforeExecuteHook, IProposalAfterExecuteHook} from "./interfaces/IProposalExecutionHooks.sol";

/// @title StoryDAO
/// @notice Governance contract coordinating literary proposals with AuthorCoin voting power.
contract StoryDAO is Governor, GovernorSettings, GovernorCountingSimple {
    /// @notice Basis point denominator used for quorum calculations.
    uint16 public constant BPS_DENOMINATOR = 10_000;

    /// @dev Thrown when attempting to configure a quorum percentage above 100%.
    error StoryDAO__InvalidQuorumBps(uint256 bps);
    /// @dev Thrown when governance actions are attempted without an associated reader profile.
    error StoryDAO__ReaderProfileRequired(address account);
    /// @dev Thrown when zero addresses are supplied for required constructor parameters.
    error StoryDAO__ZeroAddress();

    /// @notice Emitted when the quorum basis points configuration changes.
    event QuorumBpsUpdated(uint256 previousBps, uint256 newBps);
    /// @notice Emitted whenever the execution hooks are updated.
    event ExecutionHooksUpdated(address indexed beforeHook, address indexed afterHook);

    /// @notice Governance voting token (AuthorCoin).
    AuthorCoin public immutable authorCoin;
    /// @notice Reader profile NFT used for gating governance actions.
    ReaderProfileNFT public immutable readerProfile;

    /// @notice Hook contract invoked prior to proposal execution (optional).
    IProposalBeforeExecuteHook public beforeExecuteHook;
    /// @notice Hook contract invoked after proposal execution (optional).
    IProposalAfterExecuteHook public afterExecuteHook;

    /// @dev Cached quorum configuration in basis points.
    uint256 private _quorumBps;

    /// @param authorCoin_ Address of the AuthorCoin ERC20 used for voting power.
    /// @param readerProfile_ Address of the ReaderProfile NFT enforcing governance access.
    /// @param votingDelay_ Number of blocks between proposal creation and voting start.
    /// @param votingPeriod_ Number of blocks voting remains open for each proposal.
    /// @param proposalThreshold_ Minimum voting power required to create a proposal.
    /// @param quorumBps_ Quorum requirement expressed in basis points of total supply.
    /// @param beforeHook_ Optional hook executed before proposal calls are performed.
    /// @param afterHook_ Optional hook executed after proposal calls are performed.
    constructor(
        AuthorCoin authorCoin_,
        ReaderProfileNFT readerProfile_,
        uint48 votingDelay_,
        uint32 votingPeriod_,
        uint256 proposalThreshold_,
        uint16 quorumBps_,
        IProposalBeforeExecuteHook beforeHook_,
        IProposalAfterExecuteHook afterHook_
    ) Governor("StoryDAO") GovernorSettings(votingDelay_, votingPeriod_, proposalThreshold_) {
        if (address(authorCoin_) == address(0) || address(readerProfile_) == address(0)) {
            revert StoryDAO__ZeroAddress();
        }
        if (quorumBps_ > BPS_DENOMINATOR) {
            revert StoryDAO__InvalidQuorumBps(quorumBps_);
        }

        authorCoin = authorCoin_;
        readerProfile = readerProfile_;
        _updateQuorumBps(quorumBps_);
        _updateExecutionHooks(beforeHook_, afterHook_);
    }

    /// @notice Return the configured quorum expressed in basis points.
    function quorumBps() external view returns (uint256) {
        return _quorumBps;
    }

    /// @notice Update the quorum requirement in basis points.
    /// @dev Callable only through a successful governance proposal.
    /// @param newQuorumBps New quorum configuration (max 10,000).
    function updateQuorumBps(uint16 newQuorumBps) external onlyGovernance {
        _updateQuorumBps(newQuorumBps);
    }

    /// @notice Update the execution hooks for proposals.
    /// @dev Callable only through a successful governance proposal.
    /// @param newBeforeHook Address of the new before-execute hook (0 to disable).
    /// @param newAfterHook Address of the new after-execute hook (0 to disable).
    function updateExecutionHooks(
        IProposalBeforeExecuteHook newBeforeHook,
        IProposalAfterExecuteHook newAfterHook
    ) external onlyGovernance {
        _updateExecutionHooks(newBeforeHook, newAfterHook);
    }

    /// @inheritdoc Governor
    function quorum(uint256) public view override returns (uint256) {
        return (authorCoin.totalSupply() * _quorumBps) / BPS_DENOMINATOR;
    }

    /// @inheritdoc Governor
    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    /// @inheritdoc Governor
    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    /// @inheritdoc Governor
    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    /// @inheritdoc Governor
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override returns (uint256) {
        if (!readerProfile.hasProfile(_msgSender())) {
            revert StoryDAO__ReaderProfileRequired(_msgSender());
        }
        return super.propose(targets, values, calldatas, description);
    }

    /// @inheritdoc Governor
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// @dev Internal helper returning voting power for an account.
    function _getVotes(address account, uint256, bytes memory)
        internal
        view
        override
        returns (uint256)
    {
        if (!readerProfile.hasProfile(account)) {
            revert StoryDAO__ReaderProfileRequired(account);
        }
        return authorCoin.balanceOf(account);
    }

    /// @inheritdoc Governor
    function _beforeExecute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override {
        super._beforeExecute(proposalId, targets, values, calldatas, descriptionHash);

        IProposalBeforeExecuteHook hook = beforeExecuteHook;
        if (address(hook) != address(0)) {
            hook.beforeProposalExecute(proposalId, targets, values, calldatas, descriptionHash);
        }
    }

    /// @inheritdoc Governor
    function _afterExecute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override {
        super._afterExecute(proposalId, targets, values, calldatas, descriptionHash);

        IProposalAfterExecuteHook hook = afterExecuteHook;
        if (address(hook) != address(0)) {
            hook.afterProposalExecute(proposalId, targets, values, calldatas, descriptionHash);
        }
    }

    /// @dev Internal helper performing quorum state updates with validation.
    function _updateQuorumBps(uint16 newQuorumBps) private {
        if (newQuorumBps > BPS_DENOMINATOR) {
            revert StoryDAO__InvalidQuorumBps(newQuorumBps);
        }
        uint256 previous = _quorumBps;
        _quorumBps = newQuorumBps;
        emit QuorumBpsUpdated(previous, newQuorumBps);
    }

    /// @dev Internal helper updating execution hook addresses.
    function _updateExecutionHooks(
        IProposalBeforeExecuteHook newBeforeHook,
        IProposalAfterExecuteHook newAfterHook
    ) private {
        beforeExecuteHook = newBeforeHook;
        afterExecuteHook = newAfterHook;
        emit ExecutionHooksUpdated(address(newBeforeHook), address(newAfterHook));
    }
}
