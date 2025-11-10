// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @dev ERC1822: Universal Upgradeable Proxy Standard proxy interface.
interface IERC1822Proxiable {
    function proxiableUUID() external view returns (bytes32);
}
