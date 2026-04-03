// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IBookSaleOracle
/// @notice Minimal interface for an oracle that verifies off-chain book sales and
///         returns the number of AuthorCoin tokens that should be minted as a
///         reward.
interface IBookSaleOracle {
    /// @notice Validate and score a book sale for inflationary minting.
    /// @param author The address that should receive the author share of the mint.
    /// @param saleId A unique identifier for the sale being verified.
    /// @param saleData Arbitrary encoded metadata about the sale.
    /// @return isValid True when the oracle recognizes the sale as authentic.
    /// @return mintAmount The total amount of AuthorCoin to mint if the sale is
    ///         valid. A value of zero implies no mint should take place.
    function verifySale(
        address author,
        bytes32 saleId,
        bytes calldata saleData
    ) external view returns (bool isValid, uint256 mintAmount);
}
