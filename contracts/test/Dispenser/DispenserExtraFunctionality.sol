pragma solidity 0.5.3;

// Contain upgraded version of the contracts for test
import '../../Dispenser.sol';


contract DispenserExtraFunctionality is Dispenser {
    //returns a number
    function dummyFunction()
        public pure
        returns(bool)
    {
        return true;
    }
}
