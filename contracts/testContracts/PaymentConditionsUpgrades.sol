/* solium-disable */
pragma solidity 0.4.25;

import '../SLA/PaymentConditions.sol';



contract PaymentConditionsExtraFunctionality is PaymentConditions{
    //returns a number
    function getNumber() public view returns(uint) {
        return 42;
    }
}

contract PaymentConditionsChangeInStorage is PaymentConditions{
    // keep track of how many times a function was called.
    mapping (address=>uint256) public called;
}

contract PaymentConditionsChangeInStorageAndLogic is PaymentConditions{
}

contract PaymentConditionsWithBug is PaymentConditions{
}

contract PaymentConditionsChangeFunctionSignature is PaymentConditions{
}