// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Blacklist is Ownable{
    mapping(address => bool) private _blacklisted;

    constructor() Ownable(msg.sender) {}

    function setBlacklist(address[] calldata blArray) external onlyOwner{
        for(uint256 i = 0; i < blArray.length; i++){
            _blacklisted[blArray[i]] = true;
        }
    }

    function resetBlacklist(address[] calldata blArray) external onlyOwner{
        for(uint256 i = 0; i < blArray.length; i++){
            _blacklisted[blArray[i]] = false;
        }
    }

    function isBlacklisted(address account) public view returns (bool){
        return _blacklisted[account];
    }
}