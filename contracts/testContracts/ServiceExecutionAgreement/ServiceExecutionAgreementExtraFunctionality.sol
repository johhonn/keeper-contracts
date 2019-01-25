pragma solidity 0.5.3;

import '../../SEA/ServiceExecutionAgreement.sol';


contract ServiceExecutionAgreementExtraFunctionality
    is ServiceExecutionAgreement
{
    //returns a number
    function getNumber()
        public pure
        returns(uint)
    {
        return 42;
    }
}
