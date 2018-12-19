pragma solidity 0.4.25;

import './ServiceAgreement.sol';

/// @title Secret Store Access Control
/// @author Ocean Protocol Team
/// @dev All function calls are currently implement without side effects

contract AccessConditions{

    mapping(bytes32 => mapping(address => bool)) private assetPermissions;

    ServiceAgreement private serviceAgreementStorage;
    event AccessGranted(bytes32 serviceId, bytes32 asset);

    modifier onlySLAPublisher(bytes32 serviceId, address publisher) {
        require(serviceAgreementStorage.getAgreementPublisher(serviceId) == publisher, 'Restricted access - only SLA publisher');
        _;
    }

    constructor(address _serviceAgreementAddress) public {
        require(_serviceAgreementAddress != address(0), 'invalid contract address');
        serviceAgreementStorage = ServiceAgreement(_serviceAgreementAddress);
    }

    /// @notice checkPermissions is called by secret store cluster.
    /// @dev this function checks if the consumer can get decryption key for published asset
    /// @param consumer , consumer's address
    /// @param documentKeyId , the document key mainly is the asset DID
    function checkPermissions(address consumer, bytes32 documentKeyId) public view  returns(bool) {
        return assetPermissions[documentKeyId][consumer];
    }

    /// @notice grantAccess called by asset publisher in order to delegate access to consumer
    /// @dev it is in charge of fulfilling the secret store access condition in service agreement
    /// @param serviceId , service agreement instance ID
    /// @param assetId , the asset DID
    //  @param documentKeyId, the asset DID ?? NEED TO BE CHECKED -- REDUNDANCY
    function grantAccess(bytes32 serviceId, bytes32 assetId, bytes32 documentKeyId) public onlySLAPublisher(serviceId, msg.sender) returns (bool) {
        bytes32 condition = serviceAgreementStorage.getConditionByFingerprint(serviceId, address(this), this.grantAccess.selector);
        bool allGood = !serviceAgreementStorage.hasUnfulfilledDependencies(serviceId, condition);
        if (!allGood)
            return;

        bytes32 valueHash = keccak256(abi.encodePacked(assetId, documentKeyId));
        require(
            serviceAgreementStorage.fulfillCondition(serviceId, this.grantAccess.selector, valueHash),
            'Cannot fulfill grantAccess condition'
        );
        address consumer = serviceAgreementStorage.getAgreementConsumer(serviceId);
        assetPermissions[documentKeyId][consumer] = true;
        emit AccessGranted(serviceId, assetId);
    }
}
