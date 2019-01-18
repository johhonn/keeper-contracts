pragma solidity 0.4.25;

// Contain upgraded version of the contracts for test
import '../../DIDRegistry.sol';


contract DIDRegistryExtraFunctionality is DIDRegistry {
    //returns a number
    function getNumber()
        public pure
        returns(uint)
    {
        return 42;
    }
}
