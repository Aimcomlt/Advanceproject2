// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @notice Interface for the feedback NFT contract that is minted once
///         reader consensus is achieved for a highlight or comment record.
interface IFeedbackNFT {
    function mintFeedback(address to, bytes32 recordHash) external returns (uint256);
}

/// @title ConcessionChain
/// @notice Registry tracking reader feedback consensus across highlights and comments.
/// @dev Highlights and comments are stored as keccak256 hashes to keep textual
///      content off-chain while still enabling deterministic lookup and consensus.
contract ConcessionChain is AccessControl {
    /// @notice Type of feedback recorded within the registry.
    enum FeedbackKind {
        Highlight,
        Comment
    }

    /// @notice Details of a registered feedback record.
    struct Record {
        FeedbackKind kind;
        address submitter;
        uint64 submittedAt;
        uint32 approvals;
        bool minted;
    }

    /// @notice Emitted when a new feedback record is created by a reader.
    event FeedbackRecorded(
        bytes32 indexed recordHash,
        FeedbackKind indexed kind,
        address indexed submitter,
        uint64 submittedAt
    );

    /// @notice Emitted whenever a reader supports an existing feedback record.
    event FeedbackSupported(bytes32 indexed recordHash, address indexed supporter, uint256 approvals);

    /// @notice Emitted once the consensus threshold has been met for a record.
    event ConsensusReached(bytes32 indexed recordHash, address indexed submitter, uint256 approvals);

    /// @notice Emitted whenever a mint request is forwarded to the Feedback NFT contract.
    event FeedbackMintRequested(
        address indexed feedbackNft,
        bytes32 indexed recordHash,
        address indexed submitter,
        uint256 approvals
    );

    /// @notice Emitted when the Feedback NFT contract is updated by an administrator.
    event FeedbackNFTUpdated(address indexed newFeedbackNft);

    /// @notice Emitted when the consensus threshold is updated by an administrator.
    event ConsensusThresholdUpdated(uint256 newThreshold);

    /// @dev Tracks the address of the feedback NFT contract that should mint rewards.
    IFeedbackNFT private _feedbackNFT;

    /// @notice Minimum number of unique supporters required before triggering a mint.
    uint256 public consensusThreshold;

    /// @dev Storage for record hash → record metadata.
    mapping(bytes32 => Record) private _records;

    /// @dev Tracks which accounts have already supported a given record hash.
    mapping(bytes32 => mapping(address => bool)) private _hasSupported;

    /// @param admin Account that receives the admin role for registry configuration.
    /// @param feedbackNft Address of the Feedback NFT contract to mint upon consensus (can be zero to disable minting).
    /// @param initialThreshold Minimum supporters required to reach consensus.
    constructor(address admin, address feedbackNft, uint256 initialThreshold) {
        require(admin != address(0), "ConcessionChain: admin required");
        require(initialThreshold > 0, "ConcessionChain: threshold required");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _updateFeedbackNFT(feedbackNft);

        consensusThreshold = initialThreshold;
    }

    /// @notice Return the address of the feedback NFT contract currently in use.
    function feedbackNFT() external view returns (address) {
        return address(_feedbackNFT);
    }

    /// @notice Compute the canonical hash for a highlight tied to a given book token.
    /// @param bookId Identifier of the book/edition the highlight references.
    /// @param highlightText Canonicalised highlight text string.
    /// @return hash keccak256 hash representing the highlight record.
    function hashHighlight(uint256 bookId, string calldata highlightText) external pure returns (bytes32 hash) {
        hash = keccak256(abi.encodePacked("HIGHLIGHT", bookId, highlightText));
    }

    /// @notice Compute the canonical hash for a comment tied to a given book token.
    /// @param bookId Identifier of the book/edition the comment references.
    /// @param commentText Canonicalised comment text string.
    /// @return hash keccak256 hash representing the comment record.
    function hashComment(uint256 bookId, string calldata commentText) external pure returns (bytes32 hash) {
        hash = keccak256(abi.encodePacked("COMMENT", bookId, commentText));
    }

    /// @notice Register or support a feedback record identified by `recordHash`.
    /// @dev The first caller creates the record, subsequent callers add their support.
    ///      Once the unique supporter count reaches `consensusThreshold`, a mint request
    ///      is issued to the Feedback NFT contract (if configured).
    /// @param recordHash keccak256 hash uniquely identifying the feedback payload.
    /// @param kind Type of feedback (highlight or comment).
    /// @return approvals Updated approval count for the feedback record.
    function recordFeedback(bytes32 recordHash, FeedbackKind kind) external returns (uint256 approvals) {
        require(recordHash != bytes32(0), "ConcessionChain: record hash required");

        Record storage record = _records[recordHash];

        if (record.submitter == address(0)) {
            record.kind = kind;
            record.submitter = msg.sender;
            record.submittedAt = uint64(block.timestamp);
            record.approvals = 1;
            record.minted = false;

            _hasSupported[recordHash][msg.sender] = true;

            emit FeedbackRecorded(recordHash, kind, msg.sender, record.submittedAt);
            emit FeedbackSupported(recordHash, msg.sender, 1);
        } else {
            require(record.kind == kind, "ConcessionChain: feedback type mismatch");
            require(!_hasSupported[recordHash][msg.sender], "ConcessionChain: already supported");

            unchecked {
                record.approvals += 1;
            }
            _hasSupported[recordHash][msg.sender] = true;

            emit FeedbackSupported(recordHash, msg.sender, record.approvals);
        }

        approvals = record.approvals;
        _maybeTriggerMint(recordHash, record);
    }

    /// @notice Return metadata about a feedback record.
    /// @param recordHash Hash identifying the feedback record.
    /// @return kind Feedback kind stored for the record.
    /// @return submitter Address that created the record.
    /// @return submittedAt Timestamp when the record was first submitted.
    /// @return approvals Current number of unique approvals.
    /// @return minted Whether the feedback NFT mint has been triggered for this record.
    function recordStatus(bytes32 recordHash)
        external
        view
        returns (
            FeedbackKind kind,
            address submitter,
            uint64 submittedAt,
            uint32 approvals,
            bool minted
        )
    {
        Record storage record = _records[recordHash];
        require(record.submitter != address(0), "ConcessionChain: unknown record");

        return (record.kind, record.submitter, record.submittedAt, record.approvals, record.minted);
    }

    /// @notice Check whether `account` has already supported the provided feedback record.
    function hasSupported(bytes32 recordHash, address account) external view returns (bool) {
        return _hasSupported[recordHash][account];
    }

    /// @notice Update the Feedback NFT contract used for minting once consensus is met.
    /// @param newFeedbackNft Address of the new Feedback NFT contract (can be zero to disable minting).
    function setFeedbackNFT(address newFeedbackNft) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _updateFeedbackNFT(newFeedbackNft);
    }

    /// @notice Update the consensus threshold required for minting feedback NFTs.
    /// @param newThreshold New minimum supporter count.
    function setConsensusThreshold(uint256 newThreshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newThreshold > 0, "ConcessionChain: threshold required");
        consensusThreshold = newThreshold;
        emit ConsensusThresholdUpdated(newThreshold);
    }

    /// @dev Internal helper to update the feedback NFT reference and emit an event.
    function _updateFeedbackNFT(address newFeedbackNft) internal {
        _feedbackNFT = IFeedbackNFT(newFeedbackNft);
        emit FeedbackNFTUpdated(newFeedbackNft);
    }

    /// @dev Attempt to trigger a Feedback NFT mint when consensus is reached.
    function _maybeTriggerMint(bytes32 recordHash, Record storage record) private {
        if (record.minted) {
            return;
        }

        if (record.approvals < consensusThreshold) {
            return;
        }

        record.minted = true;

        address nft = address(_feedbackNFT);
        if (nft != address(0)) {
            _feedbackNFT.mintFeedback(record.submitter, recordHash);
            emit FeedbackMintRequested(nft, recordHash, record.submitter, record.approvals);
        }

        emit ConsensusReached(recordHash, record.submitter, record.approvals);
    }
}
