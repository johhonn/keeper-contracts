/* solium-disable */
pragma solidity 0.4.25;

import '../SLA/FitchainConditions.sol';



contract FitchainConditionsExtraFunctionality is FitchainConditions{
    //returns a number
    function getNumber() public view returns(uint) {
        return 42;
    }
}

contract FitchainConditionsChangeInStorage is FitchainConditions{
    // keep track of how many times a function was called.
    mapping (address=>uint256) public called;
}

contract FitchainConditionsChangeInStorageAndLogic is FitchainConditions{
}

contract FitchainConditionsWithBug is FitchainConditions{
}

contract FitchainConditionsChangeFunctionSignature is FitchainConditions{
}
