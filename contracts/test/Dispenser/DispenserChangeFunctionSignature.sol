pragma solidity 0.5.3;

// Contain upgraded version of the contracts for test
import '../../Dispenser.sol';

contract DispenserChangeFunctionSignature is Dispenser {
    function setMinPeriod(
        uint period,
        address caller
    )
        public
    {
        require(
            msg.sender == caller,
            'Invalid caller address'
        );
        // set min period of time before next request (in seconds)
        minPeriod = period;
    }
}

