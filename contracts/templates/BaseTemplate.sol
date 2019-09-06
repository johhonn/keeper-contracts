pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './AgreementTemplate.sol';
import '../registry/DIDRegistry.sol';

contract BaseTemplate is AgreementTemplate {

    event AgreementCreated(
        bytes32 indexed _agreementId,
        bytes32 _did,
        address[] actors,
        uint[]  _timeLocks,
        uint[]  _timeOuts,
        uint256 _agreementDuration
    );

    struct ActorData {
        // agreementId => actorAddress => actorType
        mapping(address => ActorType) actorTypes;
        address[] actors;
    }
    
    // agreementID => ActorData
    mapping(bytes32 => ActorData) private actorsData;
    bytes32[] private agreements;
    
    enum ActorType{
        Consumer,
        Owner,
        Provider,
        Publisher,
        Curator,
        Verifier,
        Miner
    }
    
   /**
    * @notice createAgreement creates agreements through agreement template
    * @dev this function initializes the agreement by setting the DID,
    *       conditions ID, timeouts, time locks and the consumer address.
    *       The DID provider/owner is automatically detected by the DID
    *       Registry
    * @param _id SEA agreement unique identifier
    * @param _did Decentralized Identifier (DID)
    * @param _conditionIds conditions ID associated with the condition types
    * @param _timeLocks the starting point of the time window ,time lock is 
    *       in block number not seconds
    * @param _timeOuts the ending point of the time window ,time lock is 
    *       in block number not seconds
    * @return the agreement index
    */
    function createAgreement(
        bytes32 _id,
        bytes32 _did,
        bytes32[] memory _conditionIds,
        uint[] memory _timeLocks,
        uint[] memory _timeOuts,
        uint256 _agreementDuration,
        address[] memory _consumers
    )
        public
        returns (uint size)
    {
        super.createAgreement(
            _id,
            _did,
            _conditionIds,
            _timeLocks,
            _timeOuts
            //_agreementDuration
        );
        
        setAgreementActors(_id, _did, _consumers);
        
        agreements.push(_id);

        emit AgreementCreated(
            _id,
            _did,
            actorsData[_id].actors,
            _timeLocks,
            _timeOuts,
            _agreementDuration
        );

        return agreements.length;
    }

   /**
    * @notice getAgreementActors return the agreement Data
    * @param _id SEA agreement unique identifier
    * @return the agreement consumer and provider addresses
    */
    function getAgreementActors(bytes32 _id)
        external
        view
        returns (
            address[] memory
        )
    {
        return actorsData[_id].actors;
    }
    
    function getAgreementActorType(
        bytes32 _id,
        address _actor
    )
        external
        view
        returns(ActorType)
    {
        return actorsData[_id].actorTypes[_actor];
    }
    
    function getAgreements()
        external
        view
        returns(
            bytes32[] memory
        )
    {
        return agreements;
    }
    
    function setAgreementActors(
        bytes32 _id,
        bytes32 _did,
        address[] memory _consumers
    )
        private
    {        
        DIDRegistry didRegistryInstance = DIDRegistry(
            agreementStoreManager.getDIDRegistryAddress()
        );
        
        address owner = address(0);
        address[] memory providers;
        
        (owner, , , , providers) = didRegistryInstance.getDIDRegister(_did);
        
        actorsData[_id].actorTypes[owner] = ActorType.Owner;
        actorsData[_id].actors.push(owner);
        
        for(uint256 i=0; i < providers.length; i++)
        {
            actorsData[_id].actorTypes[providers[i]] = ActorType.Provider;
            actorsData[_id].actors.push(providers[i]);
        }
        
        for(uint256 i=0; i < _consumers.length; i++)
        {
            require(
                _consumers[i] != address(0),
                'Invalid actor address'
            );
            
            actorsData[_id].actorTypes[_consumers[i]] = ActorType.Consumer;
            actorsData[_id].actors.push(_consumers[i]);
        }
        
        //TODO: verifiers, curators and miners will be added here later 
        //TODO: through creating instance of their registries using their
        //TODO: own interfaces like the same we do with owner, and providers
    }
}
