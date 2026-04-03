// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IBookSaleOracle} from "../interfaces/IBookSaleOracle.sol";

/// @title BookSaleOracleMock
/// @notice Testing helper that allows configuring deterministic sale outcomes.
contract BookSaleOracleMock is IBookSaleOracle {
    struct SaleConfig {
        bool isValid;
        uint256 mintAmount;
    }

    mapping(bytes32 saleId => SaleConfig) private _sales;

    /// @notice Configure the result that should be returned for a sale identifier.
    function setSale(
        bytes32 saleId,
        bool isValid,
        uint256 mintAmount
    ) external {
        _sales[saleId] = SaleConfig({isValid: isValid, mintAmount: mintAmount});
    }

    /// @inheritdoc IBookSaleOracle
    function verifySale(
        address,
        bytes32 saleId,
        bytes calldata
    ) external view override returns (bool isValid, uint256 mintAmount) {
        SaleConfig memory config = _sales[saleId];
        return (config.isValid, config.mintAmount);
    }
}
