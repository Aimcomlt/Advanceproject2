// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Initializable
/// @notice Utility base contract to aid in writing upgradeable contracts.
abstract contract Initializable {
    /// @dev Indicates the contract has been initialized to a specific version.
    uint8 private _initialized;

    /// @dev Indicates the contract is in the process of being initialized.
    bool private _initializing;

    /// @notice Emitted when the contract is initialized or reinitialized.
    event Initialized(uint8 version);

    /// @dev Modifier to protect an initializer function from being invoked twice.
    modifier initializer() {
        if (!_initializing && _initialized >= 1) {
            revert("Initializable: contract is already initialized");
        }
        bool isTopLevelCall = !_initializing;
        if (isTopLevelCall) {
            _initializing = true;
            _initialized = 1;
        }
        _;
        if (isTopLevelCall) {
            _initializing = false;
            emit Initialized(1);
        }
    }

    /// @dev Modifier to protect a reinitializer function so it can only be invoked once per version.
    modifier reinitializer(uint8 version) {
        if (_initializing || _initialized >= version) {
            revert("Initializable: contract is already initialized");
        }
        _initializing = true;
        _initialized = version;
        _;
        _initializing = false;
        emit Initialized(version);
    }

    /// @dev Modifier to restrict function calls to initialization context.
    modifier onlyInitializing() {
        if (!_initializing) {
            revert("Initializable: contract is not initializing");
        }
        _;
    }

    /// @notice Lock the contract, preventing any future reinitialization.
    function _disableInitializers() internal virtual {
        if (_initializing) {
            revert("Initializable: contract is initializing");
        }
        if (_initialized != type(uint8).max) {
            _initialized = type(uint8).max;
            emit Initialized(type(uint8).max);
        }
    }

    /// @notice Returns the highest initialization version executed.
    function _getInitializedVersion() internal view returns (uint8) {
        return _initialized;
    }

    /// @notice Returns true if the contract is currently initializing.
    function _isInitializing() internal view returns (bool) {
        return _initializing;
    }
}
