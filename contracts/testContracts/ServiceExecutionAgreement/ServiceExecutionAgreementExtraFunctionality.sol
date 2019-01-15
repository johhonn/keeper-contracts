/* solium-disable */
pragma solidity 0.4.25;

import '../../SEA/ServiceExecutionAgreement.sol';


contract ServiceExecutionAgreementExtraFunctionality is ServiceExecutionAgreement{
    //returns a number
    function getNumber()
        public pure
        returns(uint)
    {
        return 42;
    }
}
