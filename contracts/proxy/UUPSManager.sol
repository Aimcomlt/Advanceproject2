// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

import {UpgradeBeacon} from "./UpgradeBeacon.sol";

interface IUUPSUpgradeableProxy {
    function upgradeTo(address newImplementation) external;

    function upgradeToAndCall(address newImplementation, bytes calldata data) external payable;
}

/// @title UUPSManager
/// @notice Coordinates upgrade execution for UUPS proxies using a DAO-governed implementation registry.
contract UUPSManager is Initializable, AccessControl, UUPSUpgradeable {
    /// @notice Role identifier for the DAO with ultimate authority over manager upgrades and configuration.
    bytes32 public constant DAO_ROLE = keccak256("DAO_ROLE");
    /// @notice Role allowed to register proxies and trigger upgrades.
    bytes32 public constant PROXY_ADMIN_ROLE = keccak256("PROXY_ADMIN_ROLE");

    /// @notice Registry contract providing approved implementation addresses.
    UpgradeBeacon public upgradeBeacon;

    /// @dev Mapping of proxy addresses to their registered upgrade identifiers.
    mapping(address proxy => bytes32 upgradeId) private _proxyUpgradeIds;

    /// @dev Emitted when the upgrade beacon reference is updated.
    event UpgradeBeaconUpdated(address indexed previousBeacon, address indexed newBeacon);
    /// @dev Emitted when a proxy is registered with the manager.
    event ProxyRegistered(address indexed proxy, bytes32 indexed upgradeId, address indexed implementation);
    /// @dev Emitted when a proxy is unregistered.
    event ProxyUnregistered(address indexed proxy, bytes32 indexed upgradeId);
    /// @dev Emitted when a proxy upgrade is executed.
    event ProxyUpgraded(address indexed proxy, bytes32 indexed upgradeId, address indexed newImplementation);

    /// @dev Error thrown when zero address values are supplied.
    error UUPSManager__ZeroAddress();
    /// @dev Error thrown when attempting to register with an empty upgrade identifier.
    error UUPSManager__InvalidUpgradeId(bytes32 upgradeId);
    /// @dev Error thrown when the requested upgrade identifier has no registered implementation.
    error UUPSManager__ImplementationNotRegistered(bytes32 upgradeId);
    /// @dev Error thrown when attempting to register an already-known proxy.
    error UUPSManager__ProxyAlreadyRegistered(address proxy);
    /// @dev Error thrown when interacting with an unknown proxy address.
    error UUPSManager__UnknownProxy(address proxy);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialise the manager with DAO governance and registry references.
    /// @param dao Address receiving administrative roles.
    /// @param upgradeBeacon_ Address of the upgrade beacon registry.
    function initialize(address dao, address upgradeBeacon_) external initializer {
        if (dao == address(0) || upgradeBeacon_ == address(0)) {
            revert UUPSManager__ZeroAddress();
        }

        upgradeBeacon = UpgradeBeacon(upgradeBeacon_);

        _grantRole(DEFAULT_ADMIN_ROLE, dao);
        _grantRole(DAO_ROLE, dao);
        _grantRole(PROXY_ADMIN_ROLE, dao);
    }

    /// @notice Update the upgrade beacon reference.
    /// @param newBeacon Address of the new upgrade beacon contract.
    function setUpgradeBeacon(address newBeacon) external onlyRole(DAO_ROLE) {
        if (newBeacon == address(0)) {
            revert UUPSManager__ZeroAddress();
        }

        address previous = address(upgradeBeacon);
        upgradeBeacon = UpgradeBeacon(newBeacon);

        emit UpgradeBeaconUpdated(previous, newBeacon);
    }

    /// @notice Register a proxy with an associated upgrade identifier.
    /// @param proxy Address of the proxy contract.
    /// @param upgradeId Identifier of the implementation family tracked by the beacon.
    function registerProxy(address proxy, bytes32 upgradeId) external onlyRole(PROXY_ADMIN_ROLE) {
        if (proxy == address(0)) {
            revert UUPSManager__ZeroAddress();
        }
        if (upgradeId == bytes32(0)) {
            revert UUPSManager__InvalidUpgradeId(upgradeId);
        }
        if (_proxyUpgradeIds[proxy] != bytes32(0)) {
            revert UUPSManager__ProxyAlreadyRegistered(proxy);
        }

        address implementation = upgradeBeacon.requireImplementation(upgradeId);
        _proxyUpgradeIds[proxy] = upgradeId;

        emit ProxyRegistered(proxy, upgradeId, implementation);
    }

    /// @notice Remove a proxy from the manager registry.
    /// @param proxy Address of the proxy to remove.
    function unregisterProxy(address proxy) external onlyRole(PROXY_ADMIN_ROLE) {
        bytes32 upgradeId = _proxyUpgradeIds[proxy];
        if (upgradeId == bytes32(0)) {
            revert UUPSManager__UnknownProxy(proxy);
        }

        delete _proxyUpgradeIds[proxy];

        emit ProxyUnregistered(proxy, upgradeId);
    }

    /// @notice Execute an upgrade for a registered proxy using the latest beacon implementation.
    /// @param proxy Address of the proxy contract to upgrade.
    function upgradeProxy(address proxy) external onlyRole(PROXY_ADMIN_ROLE) {
        _upgradeProxy(proxy, "");
    }

    /// @notice Execute an upgrade and call sequence for a registered proxy using the latest beacon implementation.
    /// @param proxy Address of the proxy contract to upgrade.
    /// @param data Calldata forwarded to the proxy during the upgrade.
    function upgradeProxyWithData(address proxy, bytes calldata data) external onlyRole(PROXY_ADMIN_ROLE) {
        _upgradeProxy(proxy, data);
    }

    /// @notice Return the upgrade identifier associated with a proxy.
    function proxyUpgradeId(address proxy) external view returns (bytes32) {
        return _proxyUpgradeIds[proxy];
    }

    /// @notice Check whether an implementation is the latest approved version for an upgrade identifier.
    function isImplementationApproved(bytes32 upgradeId, address implementation) external view returns (bool) {
        return upgradeBeacon.implementationOf(upgradeId) == implementation;
    }

    /// @dev Internal helper executing the upgrade logic for a proxy.
    function _upgradeProxy(address proxy, bytes memory data) private {
        bytes32 upgradeId = _proxyUpgradeIds[proxy];
        if (upgradeId == bytes32(0)) {
            revert UUPSManager__UnknownProxy(proxy);
        }

        address implementation = upgradeBeacon.implementationOf(upgradeId);
        if (implementation == address(0)) {
            revert UUPSManager__ImplementationNotRegistered(upgradeId);
        }

        if (data.length == 0) {
            IUUPSUpgradeableProxy(proxy).upgradeTo(implementation);
        } else {
            IUUPSUpgradeableProxy(proxy).upgradeToAndCall{value: 0}(implementation, data);
        }

        emit ProxyUpgraded(proxy, upgradeId, implementation);
    }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address) internal override onlyRole(DAO_ROLE) {}
}
