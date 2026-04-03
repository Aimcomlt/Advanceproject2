// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

import {UUPSManager} from "../proxy/UUPSManager.sol";

/// @title ManagedModuleBase
/// @notice Base contract for UUPS modules governed by the shared UUPSManager.
abstract contract ManagedModuleBase is Initializable, UUPSUpgradeable {
    /// @notice Manager contract coordinating upgrades.
    UUPSManager public manager;
    /// @notice Identifier associated with this module family within the beacon registry.
    bytes32 public upgradeId;
    /// @notice Example state variable to validate upgrade data retention in tests.
    uint256 public value;

    /// @dev Error thrown when the manager attempts to upgrade without approval.
    error ManagedModule__ImplementationNotApproved(bytes32 upgradeId, address implementation);
    /// @dev Error thrown when upgrades are attempted by callers other than the manager contract.
    error ManagedModule__UnauthorizedUpgrade(address caller);
    /// @dev Error thrown when zero address values are supplied.
    error ManagedModule__ZeroAddress();
    /// @dev Error thrown when the upgrade identifier is empty.
    error ManagedModule__InvalidUpgradeId(bytes32 upgradeId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Shared initialisation logic for inheriting modules.
    function __ManagedModuleBase_init(address manager_, bytes32 upgradeId_, uint256 initialValue)
        internal
        onlyInitializing
    {
        if (manager_ == address(0)) {
            revert ManagedModule__ZeroAddress();
        }
        if (upgradeId_ == bytes32(0)) {
            revert ManagedModule__InvalidUpgradeId(upgradeId_);
        }

        manager = UUPSManager(manager_);
        upgradeId = upgradeId_;
        value = initialValue;
    }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override {
        if (msg.sender != address(manager)) {
            revert ManagedModule__UnauthorizedUpgrade(msg.sender);
        }
        if (!manager.isImplementationApproved(upgradeId, newImplementation)) {
            revert ManagedModule__ImplementationNotApproved(upgradeId, newImplementation);
        }
    }
}

/// @title ManagedModuleV1
/// @notice First version of an example module used for integration tests.
contract ManagedModuleV1 is ManagedModuleBase {
    /// @notice Initialise the module with manager coordination and example state.
    function initialize(address manager_, bytes32 upgradeId_, uint256 initialValue) external initializer {
        __ManagedModuleBase_init(manager_, upgradeId_, initialValue);
    }

    /// @notice Human-readable version identifier used in tests.
    function version() external pure virtual returns (string memory) {
        return "v1";
    }

    /// @notice Update the stored value, demonstrating mutable state.
    function setValue(uint256 newValue) external {
        value = newValue;
    }
}

/// @title ManagedModuleV2
/// @notice Second version of the example module adding new functionality.
contract ManagedModuleV2 is ManagedModuleV1 {
    /// @inheritdoc ManagedModuleV1
    function version() external pure override returns (string memory) {
        return "v2";
    }

    /// @notice Increment the stored value, demonstrating new functionality post-upgrade.
    function increment() external {
        value += 1;
    }
}
