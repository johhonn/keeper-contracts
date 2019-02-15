pragma solidity ^0.5.3;

import 'zos-lib/contracts/Initializable.sol';
import './LogicLibrary.sol';

contract StorageContract is Initializable {

    using LogicLibrary for LogicLibrary.S;
    LogicLibrary.S private store;

    function mySetS(uint _s) public {
        store.setS(_s);
    }

    function myGetS() public view returns(uint){
        return store.getS();
    }
}

