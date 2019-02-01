pragma solidity 0.5.3;

import '../../SEA/ComputeConditions.sol';
import '../../SEA/ServiceExecutionAgreement.sol';
import 'zos-lib/contracts/Initializable.sol';


contract ComputeConditionsExtraFunctionality is ComputeConditions {
    //returns a number
    function getNumber()
        public pure
        returns(uint)
    {
        return 42;
    }
}
