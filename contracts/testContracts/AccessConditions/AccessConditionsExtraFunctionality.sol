pragma solidity 0.5.3;

import '../../SEA/AccessConditions.sol';
import '../../SEA/ServiceExecutionAgreement.sol';
import 'zos-lib/contracts/Initializable.sol';


contract AccessConditionsExtraFunctionality is AccessConditions {
    //returns a number
    function getNumber()
        public pure
        returns(uint)
    {
        return 42;
    }
}
