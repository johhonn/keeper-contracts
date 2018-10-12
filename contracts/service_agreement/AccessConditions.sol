pragma solidity ^0.4.25;

import 'ServiceAgreement.sol';


contract AccessConditions{

    ServiceAgreement private serviceAgreementStorage;
    event AccessGranted(string _type, bytes32 serviceId, bytes32 condition, bytes32 asset);

    constructor(address _serviceAgreementAddress) public {
        require(_serviceAgreementAddress != address(0), 'invalid contract address');
        serviceAgreementStorage = ServiceAgreement(_serviceAgreementAddress);
    }

    function grantAccess(bytes32 serviceId, bytes32 assetId) public returns (bool);
}
