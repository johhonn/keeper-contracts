pragma solidity ^0.5.3;

import 'zos-lib/contracts/Initializable.sol';

library LogicLibrary {
    struct S {
        uint s;
    }

    function setS(LogicLibrary.S storage _self, uint _s) public {
        _self.s = _s;
    }

    function getS(LogicLibrary.S storage _self) public view returns (uint){
        return _self.s;
    }
}
