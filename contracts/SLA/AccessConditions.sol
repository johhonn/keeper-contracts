pragma solidity 0.4.25;

import './ServiceExecutionAgreement.sol';

/// @title Secret Store Access Control
/// @author Ocean Protocol Team
/// @dev All function calls are currently implement without side effects

contract AccessConditions{

    mapping(bytes32 => mapping(address => bool)) private assetPermissions;

    ServiceExecutionAgreement private agreementStorage;
    event AccessGranted(bytes32 serviceId, bytes32 asset);

    modifier onlySLAPublisher(bytes32 serviceId, address publisher) {
        require(agreementStorage.getAgreementPublisher(serviceId) == publisher, 'Restricted access - only SLA publisher');
        _;
    }

    constructor(address _agreementAddress) public {
        require(_agreementAddress != address(0), 'invalid contract address');
        agreementStorage = ServiceExecutionAgreement(_agreementAddress);
    }

    function checkPermissions(address consumer, bytes32 documentKeyId) public view  returns(bool) {
        return assetPermissions[documentKeyId][consumer];
    }

    function grantAccess(bytes32 serviceId, bytes32 assetId, bytes32 documentKeyId) public onlySLAPublisher(serviceId, msg.sender) returns (bool) {
        bytes32 condition = agreementStorage.generateConditionKeyForId(serviceId, address(this), this.grantAccess.selector);
        bool allgood = !agreementStorage.hasUnfulfilledDependencies(serviceId, condition);
        if (!allgood)
            return;

        bytes32 valueHash = keccak256(abi.encodePacked(assetId, documentKeyId));
        require(
            agreementStorage.fulfillCondition(serviceId, this.grantAccess.selector, valueHash),
            'Cannot fulfill grantAccess condition'
        );
        address consumer = agreementStorage.getAgreementConsumer(serviceId);
        assetPermissions[documentKeyId][consumer] = true;
        emit AccessGranted(serviceId, assetId);
    }
}
