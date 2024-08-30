// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBlacklisted.sol";

contract Token is ERC20, Ownable{
    address public blAddress;

    constructor(string memory tokenName, string memory tokenSym, address blAddress_) ERC20 (tokenName, tokenSym) Ownable(msg.sender) {
        blAddress = blAddress_;
     }

    function mint (address account, uint256 amount) public onlyOwner{
         _beforeTokenTransfer(msg.sender, account, amount);
        _mint(account, amount);
    }

    function burn(uint256 amount) public{ //Ognuno puo' bruciare i suoi token ma non quelli degli altri
        _beforeTokenTransfer(msg.sender, address(0), amount);
        _burn(msg.sender, amount);
    }

    function transfer(address to, uint256 value) public override returns (bool){ 
        _beforeTokenTransfer(msg.sender, to, value);
        super._transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public override returns (bool) {
        _beforeTokenTransfer(from, to, value);
        super._transfer(from, to, value);
        return true;
    }

    function _beforeTokenTransfer(address from, address to, uint256 value) internal view{ //Condizioni per il trasferimento
        if(IBlacklisted(blAddress).isBlacklisted(from) || IBlacklisted(blAddress).isBlacklisted(to)){
            revert("Address is blacklisted");
        }
    }

}