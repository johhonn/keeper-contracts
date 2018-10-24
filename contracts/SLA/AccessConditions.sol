pragma solidity 0.4.25;

import './ServiceAgreement.sol';


contract AccessConditions{

    ServiceAgreement private serviceAgreementStorage;
    event AccessGranted(bytes32 serviceId, bytes32 asset);

    constructor(address _serviceAgreementAddress) public {
        require(_serviceAgreementAddress != address(0), 'invalid contract address');
        serviceAgreementStorage = ServiceAgreement(_serviceAgreementAddress);
    }

    function grantAccess(bytes32 serviceId, bytes32 assetId) public returns (bool) {
        bytes32 condition = serviceAgreementStorage.getConditionByFingerprint(serviceId, address(this), this.grantAccess.selector);
        bool allgood = !serviceAgreementStorage.hasUnfulfilledDependencies(serviceId, condition);
        if (!allgood)
            return;

        bytes32 valueHash = keccak256(abi.encodePacked(assetId));
        require(serviceAgreementStorage.fulfillCondition(serviceId, this.grantAccess.selector, valueHash), 'Cannot fulfill lockPayment condition');

        emit AccessGranted(serviceId, assetId);
    }
}
