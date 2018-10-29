pragma solidity 0.4.25;

import './ServiceAgreement.sol';


contract AccessConditions{

    mapping(bytes32 => mapping(address => bool)) private assetPermissions;

    ServiceAgreement private serviceAgreementStorage;
    event AccessGranted(bytes32 serviceId, bytes32 asset);

    constructor(address _serviceAgreementAddress) public {
        require(_serviceAgreementAddress != address(0), 'invalid contract address');
        serviceAgreementStorage = ServiceAgreement(_serviceAgreementAddress);
    }

    function checkAssetPermission(bytes32 documentKeyId, address consumer) view public returns(bool) {
        return assetPermissions[documentKeyId][consumer];
    }

    function grantAccess(bytes32 serviceId, bytes32 assetId, bytes32 documentKeyId) public returns (bool) {
        bytes32 condition = serviceAgreementStorage.getConditionByFingerprint(serviceId, address(this), this.grantAccess.selector);
        bool allgood = !serviceAgreementStorage.hasUnfulfilledDependencies(serviceId, condition);
        if (!allgood)
            return;

        bytes32 valueHash = keccak256(abi.encodePacked(assetId, documentKeyId));
        require(
            serviceAgreementStorage.fulfillCondition(serviceId, this.grantAccess.selector, valueHash),
            'Cannot fulfill grantAccess condition'
        );
        address consumer = serviceAgreementStorage.getServiceAgreementConsumer(serviceId);
        assetPermissions[documentKeyId][consumer] = true;
        emit AccessGranted(serviceId, assetId);
    }
}
