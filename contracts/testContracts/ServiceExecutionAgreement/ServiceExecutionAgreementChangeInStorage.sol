pragma solidity 0.4.25;

import '../../SEA/ServiceExecutionAgreement.sol';


contract ServiceExecutionAgreementChangeInStorage is ServiceExecutionAgreement{
    // keep track of how many times a function was called.
    mapping (address=>uint256) public called;
}
