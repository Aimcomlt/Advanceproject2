// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

import {AuthorCoin} from "../token/AuthorCoin.sol";

/// @title TransparentTreasury
/// @notice Treasury contract that accounts for incoming revenue streams and distributes
///         funds to readers and contributors under StoryDAO governance control.
contract TransparentTreasury is AccessControl {
    /// @notice Role allowed to manage revenue streams and execute payouts.
    bytes32 public constant STREAM_MANAGER_ROLE = keccak256("STREAM_MANAGER_ROLE");
    /// @notice Role allowed to issue discretionary contributor rewards.
    bytes32 public constant REWARD_MANAGER_ROLE = keccak256("REWARD_MANAGER_ROLE");

    /// @dev Emitted when revenue is attributed to a stream.
    event StreamRevenueRecorded(
        bytes32 indexed streamId,
        uint256 amount,
        uint256 totalRecorded,
        address indexed operator
    );
    /// @dev Emitted when a stream payout is executed.
    event StreamPayout(
        bytes32 indexed streamId,
        address indexed recipient,
        uint256 amount,
        address indexed operator
    );
    /// @dev Emitted when a contributor reward is transferred.
    event ContributorRewarded(address indexed contributor, uint256 amount, address indexed operator);

    /// @dev Error thrown when zero address values are supplied where not allowed.
    error TransparentTreasury__ZeroAddress();
    /// @dev Error thrown when attempting to process a zero amount.
    error TransparentTreasury__InvalidAmount();
    /// @dev Error thrown when a stream payout exceeds the tracked balance for that stream.
    error TransparentTreasury__InsufficientStreamBalance(
        bytes32 streamId,
        uint256 requested,
        uint256 available
    );
    /// @dev Error thrown when there are not enough unallocated funds in the treasury.
    error TransparentTreasury__InsufficientUnallocatedBalance(uint256 requested, uint256 available);
    /// @dev Error thrown when internal accounting invariants are violated.
    error TransparentTreasury__BalanceInvariant();

    /// @notice AuthorCoin token used for all treasury transfers.
    AuthorCoin public immutable authorCoin;
    /// @notice Address of the StoryDAO contract responsible for administering treasury permissions.
    address public immutable storyDao;

    struct Stream {
        uint256 totalRecorded;
        uint256 totalReleased;
    }

    /// @dev Mapping of revenue stream identifiers to their accounting data.
    mapping(bytes32 => Stream) private _streams;
    /// @dev Amount of AuthorCoin currently reserved for outstanding stream obligations.
    uint256 private _accountedBalance;

    /// @param authorCoin_ Address of the AuthorCoin token contract backing the treasury.
    /// @param storyDao_ Address of the StoryDAO governance contract administering permissions.
    constructor(AuthorCoin authorCoin_, address storyDao_) {
        if (address(authorCoin_) == address(0) || storyDao_ == address(0)) {
            revert TransparentTreasury__ZeroAddress();
        }
        authorCoin = authorCoin_;
        storyDao = storyDao_;

        _grantRole(DEFAULT_ADMIN_ROLE, storyDao_);
        _grantRole(STREAM_MANAGER_ROLE, storyDao_);
        _grantRole(REWARD_MANAGER_ROLE, storyDao_);
    }

    /// @notice Return aggregate accounting information for a revenue stream.
    /// @param streamId Identifier of the revenue stream.
    /// @return totalRecorded Total AuthorCoin attributed to the stream.
    /// @return totalReleased Total AuthorCoin already paid out from the stream.
    /// @return available Remaining AuthorCoin available for payouts from the stream.
    function streamInfo(bytes32 streamId)
        external
        view
        returns (uint256 totalRecorded, uint256 totalReleased, uint256 available)
    {
        Stream storage stream = _streams[streamId];
        totalRecorded = stream.totalRecorded;
        totalReleased = stream.totalReleased;
        available = totalRecorded - totalReleased;
    }

    /// @notice Amount of AuthorCoin currently reserved for active streams.
    function accountedBalance() external view returns (uint256) {
        return _accountedBalance;
    }

    /// @notice Amount of AuthorCoin not yet attributed to any stream and available for rewards.
    function unallocatedBalance() external view returns (uint256) {
        uint256 balance = authorCoin.balanceOf(address(this));
        uint256 accounted = _accountedBalance;
        if (balance < accounted) {
            revert TransparentTreasury__BalanceInvariant();
        }
        return balance - accounted;
    }

    /// @notice Attribute treasury-held AuthorCoin to a revenue stream.
    /// @param streamId Identifier of the stream receiving the funds.
    /// @param amount Amount of tokens to assign to the stream.
    function recordStreamRevenue(bytes32 streamId, uint256 amount)
        external
        onlyRole(STREAM_MANAGER_ROLE)
    {
        if (amount == 0) {
            revert TransparentTreasury__InvalidAmount();
        }

        uint256 balance = authorCoin.balanceOf(address(this));
        uint256 accounted = _accountedBalance;
        if (balance < accounted) {
            revert TransparentTreasury__BalanceInvariant();
        }

        uint256 available = balance - accounted;
        if (available < amount) {
            revert TransparentTreasury__InsufficientUnallocatedBalance(amount, available);
        }

        Stream storage stream = _streams[streamId];
        stream.totalRecorded += amount;
        _accountedBalance = accounted + amount;

        emit StreamRevenueRecorded(streamId, amount, stream.totalRecorded, _msgSender());
    }

    /// @notice Distribute funds from a revenue stream to a recipient.
    /// @param streamId Identifier of the revenue stream.
    /// @param recipient Address receiving the streamed payout.
    /// @param amount Amount of tokens to distribute.
    function streamTo(bytes32 streamId, address recipient, uint256 amount)
        external
        onlyRole(STREAM_MANAGER_ROLE)
    {
        if (recipient == address(0)) {
            revert TransparentTreasury__ZeroAddress();
        }
        if (amount == 0) {
            revert TransparentTreasury__InvalidAmount();
        }

        Stream storage stream = _streams[streamId];
        uint256 available = stream.totalRecorded - stream.totalReleased;
        if (available < amount) {
            revert TransparentTreasury__InsufficientStreamBalance(streamId, amount, available);
        }

        stream.totalReleased += amount;
        _accountedBalance -= amount;

        authorCoin.transfer(recipient, amount);

        emit StreamPayout(streamId, recipient, amount, _msgSender());
    }

    /// @notice Transfer unallocated AuthorCoin to a contributor as a reward.
    /// @param contributor Address of the contributor receiving rewards.
    /// @param amount Amount of tokens to transfer.
    function rewardContributor(address contributor, uint256 amount)
        external
        onlyRole(REWARD_MANAGER_ROLE)
    {
        if (contributor == address(0)) {
            revert TransparentTreasury__ZeroAddress();
        }
        if (amount == 0) {
            revert TransparentTreasury__InvalidAmount();
        }

        uint256 balance = authorCoin.balanceOf(address(this));
        uint256 accounted = _accountedBalance;
        if (balance < accounted) {
            revert TransparentTreasury__BalanceInvariant();
        }

        uint256 available = balance - accounted;
        if (available < amount) {
            revert TransparentTreasury__InsufficientUnallocatedBalance(amount, available);
        }

        authorCoin.transfer(contributor, amount);

        emit ContributorRewarded(contributor, amount, _msgSender());
    }
}
