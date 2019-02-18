pragma solidity ^0.5.3;

import 'zos-lib/contracts/Initializable.sol';
import './LogicLibraryExtendedData.sol';

contract StorageContractLibraryExtendedData is Initializable {

    using LogicLibraryExtendedData for LogicLibraryExtendedData.S;
    LogicLibraryExtendedData.S private store;

    function mySetS(uint _s) public {
        store.setS(_s);
    }

    function myGetS() public view returns(uint s, address sender){
        return store.getS();
    }
}
