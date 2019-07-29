pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './Condition.sol';
import '../ISecretStore.sol';
import '../registry/DIDRegistry.sol';
import '../agreements/AgreementStoreManager.sol';

/**
 * @title Access Secret Store Condition
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Access Secret Store Condition
 *
 *      Access Secret Store Condition is special condition
 *      where parity secret store can encrypt/decrypt documents 
 *      based on the on-chain granted permissions. For a given DID 
 *      document, and agreement ID, the owner/provider of the DID 
 *      will fulfill the condition. Consequently secret store 
 *      will check whether the permission is granted for the consumer
 *      in order to encrypt/decrypt the document.
 */
contract AccessSecretStoreCondition is Condition, ISecretStore {

    struct DocumentPermission {
        bytes32 agreementId;
        mapping(address => bool) permission;
    }

    mapping(bytes32 => DocumentPermission) private documentPermissions;

    AgreementStoreManager private agreementStoreManager;
    
    DIDRegistry private didRegistry;
    
    event Fulfilled(
        bytes32 indexed _agreementId,
        bytes32 indexed _documentId,
        address indexed _grantee,
        bytes32 _conditionId
    );

   /**
    * @notice initialize init the 
    *       contract with the following parameters
    * @dev this function is called only once during the contract
    *       initialization.
    * @param _owner contract's owner account address
    * @param _conditionStoreManagerAddress condition store manager address
    * @param _agreementStoreManagerAddress agreement store manager address
    */
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _agreementStoreManagerAddress,
        address _didRegistryAddress
    )
        external
        initializer()
    {
        require(
            _owner != address(0) ||
            _conditionStoreManagerAddress != address(0) ||
            _agreementStoreManagerAddress != address(0) ||
            _didRegistryAddress != address(0),
            'Invalid contract(s) addresses'
        );
        
        Ownable.initialize(_owner);

        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );

        agreementStoreManager = AgreementStoreManager(
            _agreementStoreManagerAddress
        );
        
        didRegistry = DIDRegistry(
            _didRegistryAddress
        );
    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _documentId refers to the DID in which secret store will issue the decryption keys
    * @param _grantee is the address of the granted user or the DID provider
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        bytes32 _documentId,
        address _grantee
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_documentId, _grantee));
    }

   /**
    * @notice fulfill access secret store condition
    * @dev only DID owner or DID provider can call this
    *       method. Fulfill method sets the permissions 
    *       for the granted consumer's address to true then
    *       fulfill the condition
    * @param _agreementId agreement identifier
    * @param _documentId refers to the DID in which secret store will issue the decryption keys
    * @param _grantee is the address of the granted user or the DID provider
    * @return condition state (Fulfilled/Aborted)
    */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _documentId,
        address _grantee
    )
        public
        returns (ConditionStoreLibrary.ConditionState)
    {
        grantPermission(
            _grantee,
            _documentId
        );
        
        bytes32 _id = generateId(
            _agreementId,
            hashValues(_documentId, _grantee)
        );

        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );

        emit Fulfilled(
            _agreementId,
            _documentId,
            _grantee,
            _id
        );

        return state;
    }
    
    function grantPermission(
        address _grantee,
        bytes32 _documentId
        
    )
        public
    {
        require(
            didRegistry.isDIDProvider(_documentId, msg.sender) || 
            msg.sender == didRegistry.getDIDOwner(_documentId),
            'Invalid DID owner/provider'
        );

        documentPermissions[_documentId].permission[_grantee] = true;
    }

    /**
    * @notice checkPermissions is called by Parity secret store
    * @param _documentId refers to the DID in which secret store will issue the decryption keys
    * @param _grantee is the address of the granted user or the DID provider
    * @return true if the access was granted
    */
    function checkPermissions(
        address _grantee,
        bytes32 _documentId
    )
        external view
        returns(bool permissionGranted)
    {
        return (
            didRegistry.isDIDProvider(_documentId, _grantee) || 
            _grantee == didRegistry.getDIDOwner(_documentId) ||
            documentPermissions[_documentId].permission[_grantee]
        );
    }
}

