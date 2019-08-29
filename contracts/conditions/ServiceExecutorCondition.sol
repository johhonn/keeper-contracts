pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import './Condition.sol';
import '../registry/DIDRegistry.sol';
import '../agreements/AgreementStoreManager.sol';

/**
 * @title Service Executor Condition
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Service Executor Condition
 *      This condition is meant to be a signal in which triggers
 *      the execution of a service. The service is fully described
 *      in the associated DID document. The provider of a service will
 *      send this signal to its workers by fulfilling the condition where
 *      they are listening to the fulfilled event.
 */
contract ServiceExecutorCondition is Condition {

    // DID --> Service Consumer address --> triggered service  ?
    mapping(bytes32 => mapping(address => bool)) private servicesStatus;
    
    AgreementStoreManager private agreementStoreManager;
    
    event Fulfilled(
        bytes32 indexed _agreementId,
        bytes32 indexed _did,
        address indexed _serviceConsumer,
        bytes32 _conditionId
    );
    
    modifier onlyDIDOwnerOrProvider(
        bytes32 _did
    )
    {
        DIDRegistry didRegistry = DIDRegistry(
            agreementStoreManager.getDIDRegistryAddress()
        );
        
        require(
            didRegistry.isDIDProvider(_did, msg.sender) || 
            msg.sender == didRegistry.getDIDOwner(_did),
            'Invalid DID owner/provider'
        );
        _;
    }

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
        address _agreementStoreManagerAddress
    )
        external
        initializer()
    {   
        Ownable.initialize(_owner);

        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );

        agreementStoreManager = AgreementStoreManager(
            _agreementStoreManagerAddress
        );
    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _did Decentralized Identifier (unique service/asset resolver) describes the service
    * @param _serviceConsumer is the consumer's address 
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        bytes32 _did,
        address _serviceConsumer
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_did, _serviceConsumer));
    }

   /**
    * @notice fulfill service executor condition
    * @dev only the service provider can fulfill this condition. By fulfilling this 
    * condition the service provider will trigger the execution of 
    * the offered job/service. The service is described in a DID document.
    * @param _agreementId agreement identifier
    * @param _did Decentralized Identifier (unique service/asset resolver) describes the service
    * @param _serviceConsumer is the consumer's address 
    * @return condition state (Fulfilled/Aborted)
    */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        address _serviceConsumer
    )
        public
        onlyDIDOwnerOrProvider(_did)
        returns (ConditionStoreLibrary.ConditionState)
    {   
        bytes32 _id = generateId(
            _agreementId,
            hashValues(_did, _serviceConsumer)
        );

        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
        
        servicesStatus[_did][_serviceConsumer] = true;
        
        emit Fulfilled(
            _agreementId,
            _did,
            _serviceConsumer,
            _id
        );
        return state;
    }
    
    /**
    * @notice isTriggeredService checks whether the service is triggered or not.
    * @param _did Decentralized Identifier (unique service/asset resolver) describes the service
    * @param _serviceConsumer is the service consumer's address
    * @return true if the service is triggered 
    */
    function wasServiceTriggered(
        bytes32 _did,
        address _serviceConsumer
    )
        public
        view
        returns (bool)
    {
        return servicesStatus[_did][_serviceConsumer];
    }
}
