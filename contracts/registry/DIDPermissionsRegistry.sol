pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './DIDRegistryLibrary.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

/**
 * @title DIDPermissionsRegistry
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the DID Permissions Registry.
 *      This contract meant to allow DID owners to grant/revoke permissions 
 */
contract DIDPermissionsRegistry is Ownable {
    // DID -> Address -> Boolean Permission
    mapping(bytes32 => mapping(address => bool)) DIDPermissions;
    
    // events
    event DIDPermissionGranted(
        bytes32 indexed _did,
        address indexed _owner,
        address indexed _grantee
    );
    
    event DIDPermissionRevoked(
        bytes32 indexed _did,
        address indexed _owner,
        address indexed _grantee
    );

    /**
     * @dev _grantPermission grants access permission to grantee 
     * @param _did refers to decentralized identifier (a bytes32 length ID)
     * @param _grantee address 
     */
    function _grantPermission(
        bytes32 _did,
        address _grantee
    )
        internal
    {
        require(
            _grantee != address(0),
            'Invalid grantee address'
        );
        DIDPermissions[_did][_grantee] = true;
        emit DIDPermissionGranted(
            _did,
            msg.sender,
            _grantee
        );
    }
    
    /**
     * @dev _revokePermission revokes access permission from grantee 
     * @param _did refers to decentralized identifier (a bytes32 length ID)
     * @param _grantee address 
     */
    function _revokePermission(
        bytes32 _did,
        address _grantee
    )
        internal
    {
        require(
            DIDPermissions[_did][_grantee],
            'Grantee already was revoked'
        );
        DIDPermissions[_did][_grantee] = false;
        emit DIDPermissionRevoked(
            _did,
            msg.sender,
            _grantee
        );
    }
    
    /**
     * @dev _getPermission gets access permission of a grantee
     * @param _did refers to decentralized identifier (a bytes32 length ID)
     * @param _grantee address 
     * @return true if grantee has access permission to a DID 
     */
    function _getPermission(
        bytes32 _did,
        address _grantee
    )
        internal
        view
        returns(bool)
    {
        return DIDPermissions[_did][_grantee];
    }
}
