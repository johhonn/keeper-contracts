pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './ServiceExecutionAgreement.sol';

/**
 * @title Fitchain conditions
 * @author Ocean Protocol Team
 * @notice This contract is WIP, don't use it for production
 * @dev All function calls are currently implemented without side effects
 */

/**
 * TODO: Implementing commit-reveal approach to avoid the front-running
 * TODO: Implement slashing conditions
 * TODO: use enum VoteType rather than 1 and 2
 */

contract FitchainConditions{

    using SafeMath for uint256;

    struct Verifier{
        bool exists;
        bool vote;
        bool nonce;
        uint256 timeout;
    }

    struct Model {
        bool exists;
        bool isTrained;
        bool isVerified;
        uint256 verifierThreshold;
        uint256[] voteCount;
        bytes32 result;
        address consumer;
        address provider;
        mapping(address => Verifier) GPCVerifiers;
        mapping(address => Verifier) VPCVerifiers;
    }

    struct Actor {
        bool isStaking;
        uint256 amount;
        uint256 slots;
        uint256 maxSlots;
    }

    address[] registry;
    mapping(bytes32 => Model) private models;
    mapping(address => Actor) private verifiers;
    uint256 private stake;
    uint256 private maxSlots;
    ServiceExecutionAgreement private agreementStorage;

    // events
    event VerifierRegistered(
        address indexed verifier,
        uint256 slots
    );
    event VerifierDeregistered(
        address indexed verifier
    );
    event VerifierElected(
        address indexed verifier,
        bytes32 indexed agreementId
    );
    event PoTInitialized(
        bool state
    );
    event VPCInitialized(
        bool state
    );
    event VerificationConditionState(
        bytes32 indexed agreementId,
        bool state
    );
    event TrainingConditionState(
        bytes32 indexed agreementId,
        bool state
    );
    event SlotsFreed(
        address indexed verifier,
        uint256 slots
    );
    event VotesSubmitted(
        bytes32 indexed agreementId,
        address indexed Publisher,
        uint256 indexed voteType
    );

    modifier onlyPublisher(bytes32 modelId) {
        require(
            agreementStorage.getAgreementPublisher(modelId) == msg.sender,
            'service provider has to be publisher'
        );
        _;
    }

    modifier onlyGPCVerifier(bytes32 modelId) {
        require(
            verifiers[msg.sender].isStaking,
            'GPC verifier is not staking'
        );
        require(
            models[modelId].exists,
            'model does not exist!'
        );
        require(
            models[modelId].GPCVerifiers[msg.sender].exists,
            'access denied invalid VPC verifier address'
        );
        _;
    }

    modifier onlyVPCVerifier(bytes32 modelId) {
        require(
            verifiers[msg.sender].isStaking,
            'VPC verifier is not staking'
        );
        require(
            models[modelId].exists,
            'model does not exist!'
        );
        require(
            models[modelId].GPCVerifiers[msg.sender].exists,
            'access denied invalid verifier address'
        );
        _;
    }

    modifier onlyVerifiers(bytes32 modelId) {
        require(
            verifiers[msg.sender].isStaking,
            'verifier is not staking'
        );
        require(
            models[modelId].exists,
            'model does not exist!'
        );
        require(
            models[modelId].GPCVerifiers[msg.sender].exists ||
            models[modelId].VPCVerifiers[msg.sender].exists,
            'access denied invalid verifier address'
        );
        _;
    }

    modifier onlyValidSlotsValue(uint256 slots) {
        require(
            slots > 0 && slots <= maxSlots,
            'invalid slots value'
        );
        _;
    }

    modifier onlyFreeSlots() {
        require(
            verifiers[msg.sender].slots == verifiers[msg.sender].maxSlots,
            'access denied, please free some slots'
        );
        _;
    }

    modifier onlyValidVotes(bytes32 modelId, uint256 voteType, uint256 count) {
        require(
            models[modelId].voteCount[voteType] == models[modelId].verifierThreshold,
            'it did not reach the total votes');
        require(
            models[modelId].voteCount[voteType] == count,
            'invalid count of votes'
        );
        _;
    }

    constructor(address agreementAddress,
      uint256 _stake,
      uint256 _maxSlots) public {
        require(
            agreementAddress != address(0),
            'invalid service agreement contract address'
        );
        require(
            _stake > 0,
            'invalid staking amount'
        );
        require(
            _maxSlots > 0,
            'invalid slots number'
        );
        agreementStorage = ServiceExecutionAgreement(agreementAddress);
        stake = _stake;
        maxSlots = _maxSlots;
    }

   /**
    * @notice registerVerifier called by any verifier in order to be registered as a verifier
    * @dev any verifier is able to register with a certain number of slots, (TODO:implementing staking)
    * @param slots refers to the number of pools that a verifier can offer to join multiple verification games at a time
    * @return true if an actor is able to register himself/herself as a verifier
    */
    function registerVerifier(
        uint256 slots
    )
        external
        onlyValidSlotsValue(slots)
        returns(bool)
    {
        // TODO: cut this stake from the verifier's balance
        verifiers[msg.sender] = Actor(true, stake * slots, slots, slots);
        for(uint256 i = 0; i < slots; i++)
            //TODO: the below line prone to 51% attack
            registry.push(msg.sender);
        emit VerifierRegistered(msg.sender, slots);
        return true;
    }

   /**
    * @notice deregisterVerifier called by any verifier in order to deregister him/herself
    * @dev checks that verifier has no longer part of any verification games, then free slot
    * @return true if all the verifier's slots are free
    */
    function deregisterVerifier()
        external onlyFreeSlots()
        returns(bool)
    {
        require(
            removeVerifierFromRegistry(msg.sender),
            'invalid deregister request'
        );
        verifiers[msg.sender].isStaking = false;
        //TODO: send back stake to verifier
        verifiers[msg.sender].amount = 0;
        emit VerifierDeregistered(msg.sender);
        return true;
    }

   /**
    * @notice initPoT called by publisher or model provider which elects verifiers
    * @dev performs some input checks, elect verifiers and notify them to start the verification game
    * @param modelId represents the SEA agreement Id in Ocean and Model Id in Fitchain
    * @param k is the number of voters that are required to witness the proof of training (PoT) in Fitchain network
    * @param timeout is the timeout period to set the vote (This will be changed for more advanced options)
    * @return true if all the challenge initiated successfully
    */
    function initPoT(
        bytes32 modelId,
        uint256 k,
        uint256 timeout
    )
        external
        onlyPublisher(modelId)
        returns(bool)
    {
        require(
            k > 0,
            'number of verifiers cannot smaller than 1'
        );
        require(
            registry.length >= k,
            'verifiers are not available'
        );
        // init model
        models[modelId] = Model(
            true,
            false,
            false,
            k,
            new uint256[](2),
            bytes32(0),
            agreementStorage.getAgreementConsumer(modelId),
            agreementStorage.getAgreementPublisher(modelId)
        );
        // get k GPC verifiers
        require(
            electRRKVerifiers(modelId, k, 1, timeout),
            'unable to allocate resources'
        );
        emit PoTInitialized(true);
        return true;
    }

   /**
    * @notice initVPCProof called by publisher or model provider electing verifiers to check the verification proof in Fitchain
    * @dev performs some security checks, elect verifiers and notify them to start the game
    * @param modelId represents the service level agreement Id in Ocean and Model Id in Fitchain
    * @param k is the number of voters that are required to witness the proof of verification in Fitchain network
    * @param timeout is the timeout period to set the vote
    * @return true if all the challenge initiated successfully
    */
    function initVPCProof(
        bytes32 modelId,
        uint256 k,
        uint256 timeout
    )
        external
        onlyPublisher(modelId)
        returns(bool)
    {
        // get k verifiers
        require(
            k > 0,
            'number of verifiers cannot smaller than 1'
        );
        require(
            registry.length >= k,
            'verifiers are not available'
        );
        require(
            electRRKVerifiers(modelId, k, 2, timeout),
            'unable to allocate resources'
        );
        emit VPCInitialized(true);
        return true;
    }

   /**
    * @notice voteForPoT called by verifiers where they vote for the existence of verification proof
    * @dev performs some security checks, set the vote and update the state of voteCount
    * and emit some events to notify the model provider/publisher that all votes have been submitted
    * @param modelId represents the SEA agreement Id in Ocean and Model Id in Fitchain
    * @param vote is the result of isTrained in Fitchain (T/F)
    */
    function voteForPoT(
        bytes32 modelId,
        bool vote
    )
        external
        onlyGPCVerifier(modelId)
        returns(bool)
    {
        require(
            !models[modelId].isTrained,
            'avoid replay attack'
        );
        require(
            !models[modelId].GPCVerifiers[msg.sender].nonce,
            'avoid reentrancy attack'
        );
        models[modelId].GPCVerifiers[msg.sender].vote = vote;
        models[modelId].GPCVerifiers[msg.sender].nonce = true;
        //TODO: if vote is false or true, we should follow the majority in order to slash the losers
        //TODO: the losers. They might be verifiers or model provider
        //TODO: commit-reveal scheme to be implemented!
        if (models[modelId].GPCVerifiers[msg.sender].vote)
            models[modelId].voteCount[0] += 1;
        if (models[modelId].voteCount[0] == models[modelId].verifierThreshold) {
            emit VotesSubmitted(
                modelId,
                agreementStorage.getAgreementPublisher(modelId),
                1
            );
        }
        return true;
    }

   /**
    * @notice voteForVPC called by verifiers where they vote for the existence of verification proof
    * @dev performs some security checks, set the vote and update the state of voteCount
    * and emit some events to notify the model provider/publisher that all votes have been submitted
    * @param modelId refers to the SEA agreement Id in Ocean and Model Id in Fitchain
    * @param vote is the result of isVerified in Fitchain (T/F)
    * @return true if the caller (verifier) is able to commit his vote regarding the VPC proof
    */
    function voteForVPC(
        bytes32 modelId,
        bool vote
    )
        external
        onlyVPCVerifier(modelId)
        returns(bool)
    {
        require(
            !models[modelId].isVerified,
            'avoid replay attack'
        );
        require(
            !models[modelId].VPCVerifiers[msg.sender].nonce,
            'avoid reentrancy attack'
        );
        models[modelId].VPCVerifiers[msg.sender].vote = vote;
        models[modelId].VPCVerifiers[msg.sender].nonce = true;
        //TODO: if vote is false or true, we should follow the majority in order to slash the losers
        //TODO: They might be verifiers or compute-data provider
        //TODO: commit-reveal scheme to be implemented!
        if (models[modelId].VPCVerifiers[msg.sender].vote)
            models[modelId].voteCount[1] += 1;
        if (models[modelId].voteCount[1] == models[modelId].verifierThreshold)
            emit VotesSubmitted(
                modelId,
                agreementStorage.getAgreementPublisher(modelId),
                2
            );
        return true;
    }

   /**
    * @notice setPoT (Gossiper pool contract in Fitchain) is called only by the service provider.
    * @dev At first It checks if the proof state is created or not, then uses the count to
    * reconstruct the right condition key based on the signed agreement
    * @param modelId refers the SEA agreement Id in Ocean and Model Id in Fitchain
    * @param count represents the number of submitted votes by verifiers who are illegible to check the PoT in Fitchain
    * @return true if the publisher is able to set the proof of training to true
    */
    function setPoT(
        bytes32 modelId,
        uint256 count
    )
        external onlyValidVotes(modelId, 0, count)
        onlyPublisher(modelId)
        returns(bool)
    {
        bytes32 condition = agreementStorage.generateConditionKeyForId(
            modelId,
            address(this),
            this.setPoT.selector
        );
        require(
            !agreementStorage.hasUnfulfilledDependencies(
                modelId,
                condition
            ),
            'condition has unfulfilled dependencies'
        );
        if (agreementStorage.getConditionStatus(modelId, condition) == 1)
            return true;
        agreementStorage.fulfillCondition(
            modelId,
            this.setPoT.selector,
            keccak256(abi.encodePacked(count))
        );
        emit TrainingConditionState(modelId, true);
        models[modelId].isTrained = true;
        return true;
    }

   /**
    * @notice setVPC (verification pool contract in Fitchain) is called only by the model provider.
    * @dev At first It checks if the proof state is created or not, then uses the count to
    * reconstruct the right condition key based on the signed agreement
    * @param modelId represents the service level agreement Id in Ocean and Model Id in Fitchain
    * @param count represents the number of submitted votes by verifiers who who are illegible to check the verification proof in Fitchain
    * @return true if the publisher is able to set the VPC proof to true
    */
    function setVPC(
        bytes32 modelId,
        uint256 count
    )
        external onlyValidVotes(modelId, 1, count)
        onlyPublisher(modelId)
        returns(bool)
    {
        bytes32 condition = agreementStorage.generateConditionKeyForId(
            modelId,
            address(this),
            this.setVPC.selector
        );
        require(
            !agreementStorage.hasUnfulfilledDependencies(
                modelId,
                condition
            ),
            'condition has unfulfilled dependencies'
        );
        if (agreementStorage.getConditionStatus(modelId, condition) == 1)
            return true;
        agreementStorage.fulfillCondition(
            modelId,
            this.setVPC.selector,
            keccak256(abi.encodePacked(models[modelId].voteCount[1]))
        );
        emit VerificationConditionState(modelId, true);
        models[modelId].isVerified = true;
        return true;
    }

   /**
    * @notice freeMySlots is called by verifier in order to be able to deregister
    * @dev it checks if the verifier is involved in a witnessing game or not
    * reconstruct the right condition key based on the signed agreement
    * @param modelId represents the SEA Id in Ocean and Model Id in Fitchain
    * @return true if a verifier is able to free its slots
    */
    function freeMySlots(bytes32 modelId)
        external onlyVerifiers(modelId)
        returns(bool)
    {
        uint256 slots = verifiers[msg.sender].slots;
        if (models[modelId].GPCVerifiers[msg.sender].exists &&
            models[modelId].isTrained ||
            models[modelId].VPCVerifiers[msg.sender].exists &&
            models[modelId].isVerified) {
            addVerifierToRegistry(msg.sender);
            slots.add(1);
        }
        emit SlotsFreed(msg.sender, slots);
        return true;
    }

   /**
    * @notice getAvailableVerifiersCount gets the number of available verifiers
    * @dev returns the number of available verifiers using registry length
    * @return number of available verifiers
    */
    function getAvailableVerifiersCount() public view returns(uint256) {
        return registry.length;
    }

   /**
    * @notice getMaximumNumberOfSlots, view function returns max number of slots
    * @dev verifiers will not be able to register if they are supplying slots > maxSlots
    * @return number of maximum slots
    */
    function getMaximumNumberOfSlots() public view returns(uint256) {
        return maxSlots;
    }

   /**
    * @notice getMyFreeSlots returns the verifier free slots
    * @return number of free slots for a verifier
    */
    function getMyFreeSlots() public view returns(uint256) {
        return verifiers[msg.sender].slots;
    }

    /**
    * @notice electRRKVerifiers private function, elects K verifiers using round-robin
    * @dev remove verifiers from registry if there is no available slots to serve more verification games
    * @param modelId represents the service level agreement Id in Ocean and Model Id in Fitchain
    * @param k is the number of required verifiers
    * @param vType represents the type of the verifier (1 -> GPC, 2 -> VPC)
    * @param timeout optional but is required to set the voting timeout
    */
    function electRRKVerifiers(
        bytes32 modelId,
        uint256 k,
        uint256 vType,
        uint256 timeout
    )
        private
        returns(bool)
    {
        for(uint256 i = 0; i < k && i < registry.length ; i++) {
            if (vType == 1) {
                models[modelId].GPCVerifiers[registry[i]] = Verifier(true, false, false, timeout);
            }
            if (vType == 2) {
                models[modelId].VPCVerifiers[registry[i]] = Verifier(true, false, false, timeout);
            }
            verifiers[registry[i]].slots.sub(1);
            emit VerifierElected(registry[i], modelId);
        }
        for(uint256 j = 0; j < registry.length; j++) {
            if (verifiers[registry[i]].slots == 0) {
                if (!removeVerifierFromRegistry(registry[i])){
                    return false;
                }
            }
        }
        return true;
    }

   /**
    * @notice addVerifierToRegistry private function maintains the verifiers registry
    * @dev add verifiers to the registry, and updates the slots number
    * @param verifier is the verifier address
    */
    function addVerifierToRegistry(
        address verifier
    )
        private
        returns(bool)
    {
        registry.push(verifier);
        verifiers[verifier].slots.add(1);
        return true;
    }

   /**
    * @notice removeVerifierFromRegistry private function maintains the verifiers registry
    * @dev removes a verifier from registry
    * @param verifier is the verifier address
    * @return true if verifier is removed from the registry
    */
    function removeVerifierFromRegistry(
        address verifier
    )
        private
        returns(bool)
    {
        //TODO: this function needs to be refactored (it is prone to gas limit failure due to expensive looping)
        for(uint256 j = 0; j<registry.length; j++) {
            if (verifier == registry[j]) {
                for (uint i = j; i < registry.length-1; i++) {
                    registry[i] = registry[i+1];
                }
                registry.length--;
                return true;
            }
        }
        return false;
    }
}
