// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "./Initializable.sol";
import {IERC1822Proxiable} from "../../interfaces/draft-IERC1822.sol";
import {ERC1967Upgrade} from "../ERC1967/ERC1967Upgrade.sol";

/// @title UUPSUpgradeable
/// @notice Minimal subset of OpenZeppelin's UUPS upgradeability pattern.
abstract contract UUPSUpgradeable is Initializable, IERC1822Proxiable, ERC1967Upgrade {
    address private immutable __self = address(this);

    modifier onlyProxy() {
        require(address(this) != __self, "UUPSUpgradeable: must be called through delegatecall");
        require(_getImplementation() == __self, "UUPSUpgradeable: must be called through active proxy");
        _;
    }

    modifier notDelegated() {
        require(address(this) == __self, "UUPSUpgradeable: must not be called through delegatecall");
        _;
    }

    function proxiableUUID() external view override notDelegated returns (bytes32) {
        return _IMPLEMENTATION_SLOT;
    }

    function upgradeTo(address newImplementation) external virtual onlyProxy {
        _authorizeUpgrade(newImplementation);
        _upgradeToAndCallUUPS(newImplementation, new bytes(0), false);
    }

    function upgradeToAndCall(address newImplementation, bytes memory data)
        external
        payable
        virtual
        onlyProxy
    {
        _authorizeUpgrade(newImplementation);
        _upgradeToAndCallUUPS(newImplementation, data, true);
    }

    function _authorizeUpgrade(address newImplementation) internal virtual;

    uint256[50] private __gap;
}
