pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/**
 * @title Agreement Store Library
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Agreement Store Library.
 *      For more information: https://github.com/oceanprotocol/OEPs/issues/125    
 *      TODO: update the OEP link 
 *      The agreement store library holds the business logic
 *      in which manages the life cycle of SEA agreement, each 
 *      agreement is linked to the DID of an asset, template, and
 *      condition IDs.
 */
library AgreementStoreLibrary {

    struct Agreement {
        bytes32 did;
        address templateId;
        bytes32[] conditionIds;
        address lastUpdatedBy;
        uint256 blockNumberUpdated;
    }

    struct AgreementList {
        mapping(bytes32 => Agreement) agreements;
        mapping(bytes32 => bytes32[]) didToAgreementIds;
        mapping(address => bytes32[]) templateIdToAgreementIds;
        bytes32[] agreementIds;
    }
    
    struct AgreementActors {
        mapping(bytes32 => mapping(address => bytes32)) AgreementActor;
    }
    
    event AgreementActorAdded(
        bytes32 indexed agreementId,
        address indexed actor
    );
    /**
     * @dev create new agreement
     *      checks whether the agreement Id exists, creates new agreement 
     *      instance, including the template, conditions and DID.
     * @param _self is AgreementList storage pointer
     * @param _id agreement identifier
     * @param _did asset decentralized identifier
     * @param _templateId template identifier
     * @param _conditionIds array of condition identifiers
     * @return size which is the index of the created agreement
     */
    function create(
        AgreementList storage _self,
        bytes32 _id,
        bytes32 _did,
        address _templateId,
        bytes32[] memory _conditionIds
    )
        internal
        returns (uint size)
    {
        require(
            _self.agreements[_id].blockNumberUpdated == 0,
            'Id already exists'
        );

        _self.agreements[_id] = Agreement({
            did: _did,
            templateId: _templateId,
            conditionIds: _conditionIds,
            lastUpdatedBy: msg.sender,
            blockNumberUpdated: block.number
        });

        _self.agreementIds.push(_id);
        _self.didToAgreementIds[_did].push(_id);
        _self.templateIdToAgreementIds[_templateId].push(_id);
        return _self.agreementIds.length;
    }
    
    /**
     * @dev setActors set a mapping between actors and their types
     * @param _self is AgreementActors storage pointer
     * @param _id agreement identifier
     * @param _actors actors addresses
     * @param _actorTypes actors types (consumer, provider, verifier, publisher, curator)
     */
    function setActors(
        AgreementActors storage _self,
        bytes32 _id,
        address[] memory _actors,
        bytes32[] memory _actorTypes
    )
        internal
    {
        require(
            _actors.length == _actorTypes.length,
            'Invalid actor/actor types array length'
        );
        
        for(uint256 i=0; i < _actors.length; i++)
        {
            _self.AgreementActor[_id][_actors[i]] = _actorTypes[i];
            emit AgreementActorAdded(
                _id,
                _actors[i]
            );
        }
    }
}
