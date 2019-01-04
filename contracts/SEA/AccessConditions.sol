pragma solidity 0.4.25;

import './ServiceExecutionAgreement.sol';
import './ISecretStore.sol';

/**
 * @title Secret Store Access Control
 * @author Ocean Protocol Team
 * @dev All function calls are currently implement without side effects
 */

contract AccessConditions is ISecretStore {

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
    * @param documentKeyId , refers to the DID in which secret store will issue the decryption keys
    * @return true if the access was granted
    */
    function checkPermissions(
        address consumer,
        bytes32 documentKeyId
    )
        public view
        returns(bool permissionGranted)
    {
        return assetPermissions[documentKeyId][consumer];
    }

    /**
    * @notice grantAccess is called by asset/resource/DID owner/SLA Publisher
    * @param agreementId , SEA agreement ID
    * @param documentKeyId , refers to the DID in which secret store will issue the decryption keys
    * @return true if the SLA publisher is able to grant access
    */
    function grantAccess(
        bytes32 agreementId,
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

        bytes32 valueHash = keccak256(abi.encodePacked(documentKeyId));
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
        emit AccessGranted(agreementId, documentKeyId);
    }
}
