/* solium-disable */
pragma solidity 0.4.25;

import '../SLA/AccessConditions.sol';



contract AccessConditionsExtraFunctionality is AccessConditions{
    //returns a number
    function getNumber() public view returns(uint) {
        return 42;
    }
}

contract AccessConditionsChangeInStorage is AccessConditions{
    // keep track of how many times a function was called.
    mapping (address=>uint256) public called;
}

contract AccessConditionsChangeInStorageAndLogic is AccessConditions{
}

contract AccessConditionsWithBug is AccessConditions{
}

contract AccessConditionsChangeFunctionSignature is AccessConditions{
}