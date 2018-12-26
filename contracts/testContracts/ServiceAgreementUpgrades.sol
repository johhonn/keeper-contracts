/* solium-disable */
pragma solidity 0.4.25;

import '../SLA/ServiceAgreement.sol';



contract ServiceAgreementExtraFunctionality is ServiceAgreement{
    //returns a number
    function getNumber() public view returns(uint) {
        return 42;
    }
}

contract ServiceAgreementChangeInStorage is ServiceAgreement{
    // keep track of how many times a function was called.
    mapping (address=>uint256) public called;
}

contract ServiceAgreementChangeInStorageAndLogic is ServiceAgreement{
}

contract ServiceAgreementWithBug is ServiceAgreement{
}

contract ServiceAgreementChangeFunctionSignature is ServiceAgreement{
}
