pragma solidity 0.5.3;

import '../../SEA/FitchainConditions.sol';
import 'zos-lib/contracts/Initializable.sol';


contract FitchainConditionsExtraFunctionality is FitchainConditions {
    //returns a number
    function getNumber()
        public pure
        returns(uint)
    {
        return 42;
    }
}
