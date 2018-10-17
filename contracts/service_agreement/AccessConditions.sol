pragma solidity 0.4.25;

import './ServiceAgreement.sol';


contract AccessConditions{

    ServiceAgreement private serviceAgreementStorage;
    event AccessGranted(bytes32 serviceId, bytes32 condition, bytes32 asset);

    constructor(address _serviceAgreementAddress) public {
        require(_serviceAgreementAddress != address(0), 'invalid contract address');
        serviceAgreementStorage = ServiceAgreement(_serviceAgreementAddress);
    }

    function grantAccess(bytes32 serviceId, bytes32 assetId) public returns (bool) {
        bytes32 condition = keccak256(abi.encodePacked(serviceAgreementStorage.getTemplateId(serviceId), address(this), this.grantAccess.selector));
        bool allgood = !serviceAgreementStorage.hasUnfulfilledDependencies(serviceId, condition);
        if (!allgood)
            return;

        require(serviceAgreementStorage.setConditionStatus(serviceId, this.grantAccess.selector), "Cannot fulfill lockPayment condition");

        emit AccessGranted(serviceId, condition, assetId);
    }
}
