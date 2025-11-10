// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

import {IBookSaleOracle} from "./interfaces/IBookSaleOracle.sol";

/// @title AuthorCoin
/// @notice ERC20 token with inflationary minting tied to verified book sales and
///         a configurable DAO treasury split.
contract AuthorCoin is ERC20Permit, AccessControl {
    /// @notice Role allowed to execute sale-triggered mints.
    bytes32 public constant SALE_EXECUTOR_ROLE = keccak256("SALE_EXECUTOR_ROLE");
    /// @notice Role allowed to move tokens held by the contract into the DAO treasury.
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    /// @dev Maximum number of basis points.
    uint16 public constant MAX_BPS = 10_000;

    /// @notice Address that receives the treasury portion of sale rewards.
    address public treasury;
    /// @notice Oracle contract responsible for validating book sales.
    IBookSaleOracle public saleOracle;

    /// @notice Share of the inflationary mint that flows to the author in basis points.
    uint16 public authorShareBps;
    /// @notice Share of the inflationary mint that flows to the treasury in basis points.
    uint16 public treasuryShareBps;
    /// @notice Aggregate amount of tokens minted through verified sales.
    uint256 public totalSaleBasedMints;

    /// @notice Emitted whenever the oracle used for sale verification changes.
    event SaleOracleUpdated(address indexed newOracle);
    /// @notice Emitted whenever the treasury address changes.
    event TreasuryUpdated(address indexed newTreasury);
    /// @notice Emitted whenever the distribution between author and treasury changes.
    event SaleSplitUpdated(uint16 authorShareBps, uint16 treasuryShareBps);
    /// @notice Emitted after a sale-triggered mint completes.
    event SaleRewardMinted(
        bytes32 indexed saleId,
        address indexed author,
        uint256 authorAmount,
        uint256 treasuryAmount,
        uint256 totalMinted
    );
    /// @notice Emitted after the treasury performs a withdrawal from contract-held funds.
    event TreasuryWithdrawal(address indexed to, uint256 amount, address indexed operator);

    /// @param admin Initial administrator of the token contract.
    /// @param initialTreasury Address that receives the treasury share of sale rewards.
    constructor(address admin, address initialTreasury)
        ERC20("AuthorCoin", "AUTH")
        ERC20Permit("AuthorCoin")
    {
        require(admin != address(0), "AuthorCoin: admin required");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(SALE_EXECUTOR_ROLE, admin);
        _grantRole(TREASURY_ROLE, admin);

        treasury = initialTreasury;
        authorShareBps = 9_000;
        treasuryShareBps = MAX_BPS - authorShareBps;
    }

    /// @notice Update the oracle contract used to validate book sales.
    /// @dev Only callable by an account with the admin role.
    function setSaleOracle(address newOracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        saleOracle = IBookSaleOracle(newOracle);
        emit SaleOracleUpdated(newOracle);
    }

    /// @notice Update the DAO treasury address.
    /// @dev Only callable by an account with the admin role.
    function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    /// @notice Configure how sale-triggered mints are split between author and treasury.
    /// @param authorBps Basis points minted to the author.
    /// @param treasuryBps Basis points minted to the treasury.
    function setSaleSplits(uint16 authorBps, uint16 treasuryBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(authorBps + treasuryBps == MAX_BPS, "AuthorCoin: invalid split");
        authorShareBps = authorBps;
        treasuryShareBps = treasuryBps;
        emit SaleSplitUpdated(authorBps, treasuryBps);
    }

    /// @notice Return the split amounts for a proposed mint.
    /// @param mintAmount The total amount of tokens that would be minted.
    /// @return authorAmount The portion that would be minted to the author.
    /// @return treasuryAmount The portion that would be minted to the treasury or contract.
    function previewSaleSplit(uint256 mintAmount)
        public
        view
        returns (uint256 authorAmount, uint256 treasuryAmount)
    {
        authorAmount = (mintAmount * authorShareBps) / MAX_BPS;
        treasuryAmount = mintAmount - authorAmount;
    }

    /// @notice Mint AuthorCoin in response to a verified book sale.
    /// @param author Recipient of the author share of the minted rewards.
    /// @param saleId Unique identifier for the sale.
    /// @param saleData Arbitrary metadata passed to the oracle for verification.
    /// @return authorAmount Amount minted to the author.
    /// @return treasuryAmount Amount minted to the treasury (or held until a treasury is set).
    function recordBookSale(address author, bytes32 saleId, bytes calldata saleData)
        external
        onlyRole(SALE_EXECUTOR_ROLE)
        returns (uint256 authorAmount, uint256 treasuryAmount)
    {
        require(address(saleOracle) != address(0), "AuthorCoin: oracle not set");
        require(author != address(0), "AuthorCoin: author required");
        (bool isValid, uint256 mintAmount) = saleOracle.verifySale(author, saleId, saleData);
        require(isValid, "AuthorCoin: sale not verified");
        require(mintAmount > 0, "AuthorCoin: nothing to mint");

        (authorAmount, treasuryAmount) = previewSaleSplit(mintAmount);

        if (authorAmount > 0) {
            _mint(author, authorAmount);
        }

        if (treasuryAmount > 0) {
            address treasuryTarget = treasury;
            if (treasuryTarget != address(0)) {
                _mint(treasuryTarget, treasuryAmount);
            } else {
                _mint(address(this), treasuryAmount);
            }
        }

        totalSaleBasedMints += mintAmount;
        emit SaleRewardMinted(saleId, author, authorAmount, treasuryAmount, mintAmount);
    }

    /// @notice Transfer contract-held tokens into the DAO treasury or to a specified recipient.
    /// @param to Destination for the transferred tokens.
    /// @param amount Amount of tokens to transfer.
    function treasuryWithdraw(address to, uint256 amount) external onlyRole(TREASURY_ROLE) {
        require(to != address(0), "AuthorCoin: invalid recipient");
        _transfer(address(this), to, amount);
        emit TreasuryWithdrawal(to, amount, _msgSender());
    }

    /// @inheritdoc AccessControl
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
