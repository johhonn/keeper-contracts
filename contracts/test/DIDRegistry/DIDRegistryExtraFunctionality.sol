pragma solidity 0.5.3;

// Contain upgraded version of the contracts for test
import '../../registry/DIDRegistry.sol';


contract DIDRegistryExtraFunctionality is DIDRegistry {
    //returns a number
    function getNumber()
        public pure
        returns(uint)
    {
        return 42;
    }
}
