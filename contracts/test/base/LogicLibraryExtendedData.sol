pragma solidity ^0.5.3;

import 'zos-lib/contracts/Initializable.sol';

library LogicLibraryExtendedData {

    struct S {
        uint s;
        address sender;
    }

    function setS(LogicLibraryExtendedData.S storage _self, uint _s) public {
        _self.sender = msg.sender;
        _self.s = _s;
    }

    function getS(LogicLibraryExtendedData.S storage _self) public view returns (uint s, address sender){
        s = _self.s;
        sender = _self.sender;
    }
}
