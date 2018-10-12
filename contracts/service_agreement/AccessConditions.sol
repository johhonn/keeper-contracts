pragma solidity ^0.4.25;

import 'browser/ServiceAgreement.sol';


contract AccessConditions{
    ServiceAgreement private serviceAgreementStorage;
    constructor(address _serviceAgreementAddress) public {
        require(_serviceAgreementAddress != address(0), 'invalid contract address');
        serviceAgreementStorage = ServiceAgreement(_serviceAgreementAddress);
    }

    function grantAccess(bytes32 serviceId, bytes32 assetId) public returns (bool);
}
