// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title UpgradeBeacon
/// @notice Registry tracking approved logic implementations for upgradeable proxies under DAO control.
contract UpgradeBeacon is Initializable, AccessControl, UUPSUpgradeable {
    /// @notice Role identifier for the DAO with ultimate upgrade authority.
    bytes32 public constant DAO_ROLE = keccak256("DAO_ROLE");
    /// @notice Role allowed to register and update implementation addresses.
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    /// @dev Emitted whenever a new implementation is registered for an upgrade identifier.
    event LogicRegistered(bytes32 indexed upgradeId, address indexed implementation, address indexed operator);
    /// @dev Emitted when an existing implementation mapping is updated.
    event LogicUpdated(
        bytes32 indexed upgradeId,
        address indexed previousImplementation,
        address indexed newImplementation,
        address operator
    );

    /// @dev Error thrown when zero address values are supplied.
    error UpgradeBeacon__ZeroAddress();
    /// @dev Error thrown when attempting to use an empty upgrade identifier.
    error UpgradeBeacon__InvalidUpgradeId(bytes32 upgradeId);
    /// @dev Error thrown when registering an upgrade identifier that already exists.
    error UpgradeBeacon__ImplementationAlreadyRegistered(bytes32 upgradeId);
    /// @dev Error thrown when an upgrade identifier has not yet been registered.
    error UpgradeBeacon__ImplementationNotRegistered(bytes32 upgradeId);
    /// @dev Error thrown when an implementation update would not change the stored value.
    error UpgradeBeacon__ImplementationUnchanged(bytes32 upgradeId);

    /// @dev Mapping of upgrade identifiers to implementation addresses.
    mapping(bytes32 upgradeId => address implementation) private _implementations;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialise the upgrade beacon with DAO governance roles.
    /// @param dao Address of the DAO granted administrative permissions.
    function initialize(address dao) external initializer {
        if (dao == address(0)) {
            revert UpgradeBeacon__ZeroAddress();
        }

        _grantRole(DEFAULT_ADMIN_ROLE, dao);
        _grantRole(DAO_ROLE, dao);
        _grantRole(REGISTRAR_ROLE, dao);
    }

    /// @notice Register a new implementation for the provided upgrade identifier.
    /// @param upgradeId Identifier representing the upgradeable contract family.
    /// @param implementation Address of the implementation contract.
    function registerLogic(bytes32 upgradeId, address implementation) external onlyRole(REGISTRAR_ROLE) {
        if (upgradeId == bytes32(0)) {
            revert UpgradeBeacon__InvalidUpgradeId(upgradeId);
        }
        if (implementation == address(0)) {
            revert UpgradeBeacon__ZeroAddress();
        }
        if (_implementations[upgradeId] != address(0)) {
            revert UpgradeBeacon__ImplementationAlreadyRegistered(upgradeId);
        }

        _implementations[upgradeId] = implementation;
        emit LogicRegistered(upgradeId, implementation, _msgSender());
    }

    /// @notice Update an existing implementation mapping.
    /// @param upgradeId Identifier representing the upgradeable contract family.
    /// @param newImplementation Address of the new implementation contract.
    function updateLogic(bytes32 upgradeId, address newImplementation) external onlyRole(REGISTRAR_ROLE) {
        if (upgradeId == bytes32(0)) {
            revert UpgradeBeacon__InvalidUpgradeId(upgradeId);
        }
        if (newImplementation == address(0)) {
            revert UpgradeBeacon__ZeroAddress();
        }

        address current = _implementations[upgradeId];
        if (current == address(0)) {
            revert UpgradeBeacon__ImplementationNotRegistered(upgradeId);
        }
        if (current == newImplementation) {
            revert UpgradeBeacon__ImplementationUnchanged(upgradeId);
        }

        _implementations[upgradeId] = newImplementation;
        emit LogicUpdated(upgradeId, current, newImplementation, _msgSender());
    }

    /// @notice Return the implementation address associated with an upgrade identifier.
    function implementationOf(bytes32 upgradeId) external view returns (address) {
        return _implementations[upgradeId];
    }

    /// @notice Return the implementation address for an upgrade identifier, reverting if unset.
    function requireImplementation(bytes32 upgradeId) external view returns (address implementation) {
        implementation = _implementations[upgradeId];
        if (implementation == address(0)) {
            revert UpgradeBeacon__ImplementationNotRegistered(upgradeId);
        }
    }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address) internal override onlyRole(DAO_ROLE) {}
}
