pragma solidity 0.4.25;

import './ServiceExecutionAgreement.sol';

/// @title Secret Store Access Control
/// @author Ocean Protocol Team
/// @dev All function calls are currently implement without side effects

contract AccessConditions{

    mapping(bytes32 => mapping(address => bool)) private assetPermissions;

    ServiceExecutionAgreement private agreementStorage;
    event AccessGranted(
        bytes32 agreementId, 
        bytes32 asset
    );

    modifier onlySLAPublisher(
        bytes32 agreementId,
        address publisher)
    {
        require(
            agreementStorage.getAgreementPublisher(agreementId) == publisher,
            'Restricted access - only SLA publisher'
        );
        _;
    }

    constructor(
        address _agreementAddress
    )
        public
    {
        require(
            _agreementAddress != address(0),
            'invalid contract address'
        );
        agreementStorage = ServiceExecutionAgreement(_agreementAddress);
    }

    function checkPermissions(
        address consumer,
        bytes32 documentKeyId
    )
        public view
        returns(bool)
    {
        return assetPermissions[documentKeyId][consumer];
    }

    function grantAccess(
        bytes32 agreementId,
        bytes32 assetId,
        bytes32 documentKeyId
    )
        public
        onlySLAPublisher(agreementId, msg.sender)
        returns (bool)
    {
        bytes32 condition = agreementStorage.generateConditionKeyForId(
            agreementId,
            address(this),
            this.grantAccess.selector
        );

        if (agreementStorage.hasUnfulfilledDependencies(agreementId, condition))
            return;

        bytes32 valueHash = hashValues(assetId, documentKeyId);
        require(
            agreementStorage.fulfillCondition(
                agreementId,
                this.grantAccess.selector,
                valueHash
            ),
            'Cannot fulfill grantAccess condition'
        );
        address consumer = agreementStorage.getAgreementConsumer(agreementId);
        assetPermissions[documentKeyId][consumer] = true;
        emit AccessGranted(agreementId, assetId);
    }

    function hashValues(
        bytes32 assetId,
        bytes32 documentKeyId
    )
        public pure
        returns (
            bytes32 valueHash
        )
    {
        return keccak256(
            abi.encodePacked(
                assetId,
                documentKeyId
            )
        );
    }
}
