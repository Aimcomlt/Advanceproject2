// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "../ERC20.sol";
import {IERC20Permit} from "./IERC20Permit.sol";
import {ECDSA} from "../../../utils/cryptography/ECDSA.sol";

abstract contract ERC20Permit is ERC20, IERC20Permit {
    bytes32 private constant _PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 private constant _TYPE_HASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 private constant _VERSION_HASH = keccak256(bytes("1"));

    mapping(address => uint256) private _nonces;

    bytes32 private immutable _hashedName;
    bytes32 private immutable _cachedDomainSeparator;
    uint256 private immutable _cachedChainId;

    constructor(string memory name_) {
        _hashedName = keccak256(bytes(name_));
        _cachedChainId = block.chainid;
        _cachedDomainSeparator = _buildDomainSeparator(_cachedChainId);
    }

    function DOMAIN_SEPARATOR() public view virtual override returns (bytes32) {
        if (block.chainid == _cachedChainId) {
            return _cachedDomainSeparator;
        }
        return _buildDomainSeparator(block.chainid);
    }

    function nonces(address owner) public view virtual override returns (uint256) {
        return _nonces[owner];
    }

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public virtual override {
        require(block.timestamp <= deadline, "ERC20Permit: expired deadline");

        uint256 currentNonce = _nonces[owner];
        bytes32 structHash = keccak256(
            abi.encode(_PERMIT_TYPEHASH, owner, spender, value, currentNonce, deadline)
        );
        bytes32 hash = ECDSA.toTypedDataHash(DOMAIN_SEPARATOR(), structHash);
        address signer = ECDSA.recover(hash, v, r, s);
        require(signer == owner, "ERC20Permit: invalid signature");
        _nonces[owner] = currentNonce + 1;
        _approve(owner, spender, value);
    }

    function _buildDomainSeparator(uint256 chainId) private view returns (bytes32) {
        return keccak256(abi.encode(_TYPE_HASH, _hashedName, _VERSION_HASH, chainId, address(this)));
    }
}
