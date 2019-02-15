pragma solidity 0.5.3;

// Contain upgraded version of the contracts for test
import '../../storage/ConditionStoreManager.sol';


contract ConditionStoreExtraFunctionality is ConditionStoreManager {
    //returns a boolean
    function dummyFunction()
        public pure
        returns(bool)
    {
        return true;
    }
}
