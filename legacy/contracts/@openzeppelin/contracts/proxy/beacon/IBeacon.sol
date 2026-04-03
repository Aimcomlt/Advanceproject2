// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IBeacon {
    function implementation() external view returns (address);
}
