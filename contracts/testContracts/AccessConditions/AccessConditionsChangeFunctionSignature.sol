pragma solidity 0.4.25;

import '../../SEA/ServiceExecutionAgreement.sol';
import '../../SEA/ISecretStore.sol';
import 'zos-lib/contracts/Initializable.sol';


/**
 * @title Secret Store Access Control
 * @author Ocean Protocol Team
 * @dev All function calls are currently implemented without side effects
 */
contract AccessConditionsChangeFunctionSignature is ISecretStore, Initializable {

    mapping(bytes32 => mapping(address => bool)) private assetPermissions;

    ServiceExecutionAgreement private agreementStorage;

    event AccessGranted(
        bytes32 indexed agreementId,
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

    function initialize(
        address _agreementAddress
    )
        public initializer()
    {
        require(
            _agreementAddress != address(0),
            'invalid contract address'
        );
        agreementStorage = ServiceExecutionAgreement(_agreementAddress);
    }

    /**
    * @notice checkPermissions is called by Parity secret store
    * @param consumer is the asset consumer address
    * @param documentKeyId refers to the DID in which secret store will issue the decryption keys
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
    * @param agreementId is the SEA agreement ID
    * @param documentKeyId refers to the DID in which secret store will issue the decryption keys
    * @return true if the SLA publisher is able to grant access
    */
    function grantAccess(
        bytes32 agreementId,
        bytes32 documentKeyId,
        address requester
    )
        external
        onlySLAPublisher(agreementId, requester)
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

        // removed for testing
        /*
        require(
            agreementStorage.fulfillCondition(
                agreementId,
                this.grantAccess.selector,
                valueHash
            ),
            'Cannot fulfill grantAccess condition'
        );
        */

        address consumer = agreementStorage.getAgreementConsumer(agreementId);
        assetPermissions[documentKeyId][consumer] = true;
        emit AccessGranted(agreementId, documentKeyId);
    }
}
