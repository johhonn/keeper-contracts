pragma solidity ^0.4.25;

import './ServiceExecutionAgreement.sol';

/**
 * @title Secret Store Access Control
 * @author Ocean Protocol Team
 * @dev All function calls are currently implement without side effects
 */

contract AccessConditions {

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

    /**
    * @notice checkPermissions is called by Parity secret store
    * @param consumer , asset consumer address
    * @param documentKeyId , refers to DID document (TODO remove the duplicate and use only one variable documentKeyId)
    * @return true if the access was granted
    */
    function checkPermissions(
        address consumer,
        bytes32 documentKeyId
    )
        public view
        returns(bool)
    {
        return assetPermissions[documentKeyId][consumer];
    }

    /**
    * @notice grantAccess is called by asset owner or SLA Publisher
    * @param agreementId , SEA agreement ID
    * @param assetId , the DID that refers to information about the service/asset or resource
    * @param documentKeyId , refers to DID document (TODO remove the duplicate and use only one variable documentKeyId)
    * @return true if the SLA publisher is able to grand access
    */
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

    /**
    * @notice hashValues a utility function which in charge of calculating the hash of input values in payment conditions
    * @param assetId , refers to DID document that hold information about the service
    * @param documentKeyId , refers to DID document (TODO remove the duplicate and use only one variable documentKeyId)
    * @return hash of asset ID and document key ID
    */
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
