// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Context} from "../utils/Context.sol";
import {ERC165} from "../utils/introspection/ERC165.sol";
import {IAccessControl} from "./IAccessControl.sol";

error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);

contract AccessControl is Context, ERC165, IAccessControl {
    struct RoleData {
        mapping(address => bool) members;
        bytes32 adminRole;
    }

    mapping(bytes32 role => RoleData) private _roles;

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    modifier onlyRole(bytes32 role) {
        _checkRole(role, _msgSender());
        _;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165)
        returns (bool)
    {
        return interfaceId == type(IAccessControl).interfaceId || super.supportsInterface(interfaceId);
    }

    function hasRole(bytes32 role, address account) public view override returns (bool) {
        return _roles[role].members[account];
    }

    function getRoleAdmin(bytes32 role) public view override returns (bytes32) {
        bytes32 adminRole = _roles[role].adminRole;
        return adminRole == bytes32(0) ? DEFAULT_ADMIN_ROLE : adminRole;
    }

    function grantRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
        if (!hasRole(role, account)) {
            return;
        }
        _roles[role].members[account] = false;
        emit RoleRevoked(role, account, _msgSender());
    }

    function renounceRole(bytes32 role, address account) public virtual override {
        require(account == _msgSender(), "AccessControl: can only renounce for self");
        if (!hasRole(role, account)) {
            return;
        }
        _roles[role].members[account] = false;
        emit RoleRevoked(role, account, _msgSender());
    }

    function _checkRole(bytes32 role, address account) internal view {
        if (!hasRole(role, account)) {
            revert AccessControlUnauthorizedAccount(account, role);
        }
    }

    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal {
        bytes32 previousAdminRole = getRoleAdmin(role);
        _roles[role].adminRole = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
    }

    function _grantRole(bytes32 role, address account) internal {
        if (hasRole(role, account)) {
            return;
        }
        _roles[role].members[account] = true;
        emit RoleGranted(role, account, _msgSender());
    }
}
