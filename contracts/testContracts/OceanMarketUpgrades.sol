/* solium-disable */
pragma solidity 0.4.25;

import '../OceanMarket.sol';



contract OceanMarketExtraFunctionality is OceanMarket{
    //returns a number
    function getNumber() public view returns(uint) {
        return 42;
    }
}

contract OceanMarketChangeInStorage is OceanMarket{
    // keep track of how many times a function was called.
    mapping (address=>uint256) public called;
}

contract OceanMarketChangeInStorageAndLogic is OceanMarket{
}

contract OceanMarketWithBug is OceanMarket{
}

contract OceanMarketChangeFunctionSignature is OceanMarket{
}
