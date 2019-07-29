pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './ISecretStore.sol';
import './registry/DIDRegistry.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
/**
 * @title Secret Store Permissions
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Secret Store Permissions
 *      
 */
contract SecretStorePermissions is ISecretStore, Ownable {
    
    struct DocumentPermission {
        mapping(address => bool) permission;
    }

    DIDRegistry private didRegistry;
    mapping(bytes32 => DocumentPermission) private documentPermissions;

    modifier onlyDIDOwnerOrProvider(
        address _grantee,
        bytes32 _documentId
    ){
        require(
            didRegistry.isDIDProvider(_documentId, msg.sender) || 
            msg.sender == didRegistry.getDIDOwner(_documentId),
            'Invalid DID owner/provider'
        );
        require(
            msg.sender != _grantee,
            'DID owner/provider can not be grantee'
        );
        _;
    }
    
   /**
    * @notice initialize init the 
    *       contract with the following parameters
    * @dev this function is called only once during the contract
    *       initialization.
    * @param _owner contract's owner account address
    * @param _didRegistryAddress DID registry contract address
    */
    function initialize(
        address _owner,
        address _didRegistryAddress
    )
        external
        initializer()
    {
        require(
            _didRegistryAddress != address(0),
            'Invalid DID Registry address'
        );
        
        Ownable.initialize(_owner);
        didRegistry = DIDRegistry(_didRegistryAddress);
        
    }
    
    function grantPermission(
        address _grantee,
        bytes32 _documentId
        
    )
        external
        onlyDIDOwnerOrProvider(_grantee, _documentId)
    {
        documentPermissions[_documentId].permission[_grantee] = true;
    }
    
    function renouncePermission(
        address _grantee,
        bytes32 _documentId
    )
        public
        onlyDIDOwnerOrProvider(_grantee, _documentId)
    {   
        documentPermissions[_documentId].permission[_grantee] = false;
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
