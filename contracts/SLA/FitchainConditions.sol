pragma solidity ^0.4.25;

import 'openzeppelin-solidity/contracts/cryptography/ECDSA.sol';
import './ServiceAgreement.sol';

/// @title Fitchain conditions
/// @author Ocean Protocol Team
/// @notice This contract is WIP, don't use if for production
/// @dev All function calls are currently implement with some side effects

/// TODO: Implementing commit-reveal approach to avoid the front-running
/// TODO: Implement slashing conditions

contract FitchainConditions{

    struct Verifier{
        bool exists;
        bool vote;
        uint256 timeout;
    }

    struct Model {
        bool exists;
        bool isTrained;
        bool isVerified;
        uint256 Kverifiers;
        uint256[] counter;
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
    mapping(bytes32 => Model) models;
    mapping(address => Actor) verifiers;
    uint256 private stake;
    ServiceAgreement private serviceAgreementStorage;

    // events
    event VerifierRegistered(address verifier, uint256 slots);
    event VerifierDeregistered(address verifier);
    event PoTInitialized(address[] verifiers, bool state);
    event VPCInitialized(address[] verifiers, bool state);
    event VerificationCondition(bytes32 serviceAgreementId, bool state);
    event TrainingCondition(bytes32 serviceAgreementId, bool state);
    event FreeSlots(address verifier, uint256 slots);

    modifier onlyProvider(bytes32 modelId){
        require(models[modelId].exists, 'model does not exist!');
        require(msg.sender == models[modelId].provider, 'invalid model provider');
        require(serviceAgreementStorage.getAgreementPublisher(modelId) == msg.sender, 'invalid service provider');
        _;
    }

    modifier onlyPublisher(bytes32 modelId){
        require(serviceAgreementStorage.getAgreementPublisher(modelId) == msg.sender, 'invalid service provider');
        _;
    }

    modifier onlyGPCVerifier(bytes32 modelId){
        require(verifiers[msg.sender].isStaking, 'invalid staking verifier');
        require(models[modelId].exists, 'model does not exist!');
        require(models[modelId].GPCVerifiers[msg.sender].exists, 'access denied invalid verifier address');
        _;
    }

    modifier onlyVPCVerifier(bytes32 modelId){
        require(verifiers[msg.sender].isStaking, 'invalid staking verifier');
        require(models[modelId].exists, 'model does not exist!');
        require(models[modelId].GPCVerifiers[msg.sender].exists, 'access denied invalid verifier address');
        _;
    }

    modifier onlyVerifiers(bytes32 modelId){
        require(verifiers[msg.sender].isStaking, 'invalid staking verifier');
        require(models[modelId].exists, 'model does not exist!');
        require(models[modelId].GPCVerifiers[msg.sender].exists || models[modelId].VPCVerifiers[msg.sender].exists, 'access denied invalid verifier address');
        _;
    }

    modifier onlyValidStakeValue(uint256 slots){
        require(slots > 0, 'invalid slots value');
        // TODO: check if verifier has the same amount of tokens
        _;
    }

    modifier onlyThisContract(){
        require(msg.sender == address(this), 'invalid internal call');
        _;
    }

    modifier onlyFreeSlots(){
        require(verifiers[msg.sender].slots == verifiers[msg.sender].maxSlots, 'access denied, please free some slots');
        _;
    }

    constructor(address serviceAgreementAddress, uint256 _stake) public {
        require(serviceAgreementAddress != address(0), 'invalid service agreement contract address');
        require(_stake > 0, 'invalid staking amount');
        serviceAgreementStorage = ServiceAgreement(serviceAgreementAddress);
        stake = _stake;
    }

    function registerVerifier(uint256 slots) public onlyValidStakeValue(slots) returns(bool){
        // TODO: cut this stake from the verifier's balance
        verifiers[msg.sender].isStaking = true;
        verifiers[msg.sender].amount = stake * slots;
        verifiers[msg.sender].slots = slots;
        for(uint256 i=0; i < slots; i++)
            //TODO: the below line prone to 51% attack
            registry.push(msg.sender);
        emit VerifierRegistered(msg.sender, slots);
        return true;
    }

    function deregisterVerifier() public onlyFreeSlots() returns(bool) {
        if(removeVerifierFromRegistry(msg.sender)){
            verifiers[msg.sender].isStaking = false;
        }
        //TODO: send back stake to verifier
        emit VerifierDeregistered(msg.sender);
        return true;
    }

    function electRRKVerifiers(uint k) private returns(address[] verifiersSet){
        if(registry.length < k) return verifiersSet;
        for(uint256 i=0; i <= k ; i++){
            if(verifiers[registry[i]].slots == 1){
                removeVerifierFromRegistry(registry[i]);
            }
            verifiersSet[i] = registry[i];
            verifiers[registry[i]].slots -=1;
        }
    }

    function addVerifierToRegistry(address verifier) private returns(bool){
        registry.push(verifier);
        verifiers[verifier].slots +=1;
        return true;
    }

    function removeVerifierFromRegistry(address verifier)  private returns(bool) {
        for(uint256 j=0; j<registry.length; j++){
            if(verifier == registry[j]){
                for (uint i=j; i< registry.length-1; i++){
                    registry[i] = registry[i+1];
                }
                registry.length--;
                return true;
            }
        }
        return false;
    }

    function initPoTProof(bytes32 modelId, uint256 k) public onlyPublisher(modelId) returns(bool){
        require(k > 0, 'invalid verifiers number');
        // get k GPC verifiers
        address[] memory GPCVerifiers = electRRKVerifiers(k);
        if(GPCVerifiers.length < k){
            emit PoTInitialized(GPCVerifiers, false);
            return false;
        }
        models[modelId] = Model(true, false, false, k, new uint256[](0), bytes32(0), serviceAgreementStorage.getServiceAgreementConsumer(modelId), serviceAgreementStorage.getAgreementPublisher(modelId));
        for(uint i=0; i< GPCVerifiers.length; i++){
            // set vote false
            models[modelId].GPCVerifiers[GPCVerifiers[i]].exists = false;
            models[modelId].GPCVerifiers[GPCVerifiers[i]].vote = false;
        }
        emit PoTInitialized(GPCVerifiers, true);
        return true;
    }

    function initVPCProof(bytes32 modelId, uint256 k) public onlyPublisher(modelId) returns(bool){
        // get k verifiers
        address[] memory VPCVerifiers = electRRKVerifiers(k);
        if(VPCVerifiers.length < k){
            emit VPCInitialized(VPCVerifiers, false);
            return false;
        }
        for(uint i=0; i< VPCVerifiers.length; i++){
            // set vote false
            models[modelId].VPCVerifiers[VPCVerifiers[i]].exists = false;
            models[modelId].VPCVerifiers[VPCVerifiers[i]].vote = false;
        }
        emit VPCInitialized(VPCVerifiers, true);
        return true;
    }

    function voteForPoT(bytes32 modelId, bool vote) public onlyGPCVerifier(modelId) returns(bool){
        require(!models[modelId].GPCVerifiers[msg.sender].exists, 'avoid replay attack');
        models[modelId].GPCVerifiers[msg.sender].vote = vote;
        models[modelId].GPCVerifiers[msg.sender].exists = true;
        if(models[modelId].GPCVerifiers[msg.sender].vote) models[modelId].counter[0] +=1;
        if(models[modelId].counter[0] == models[modelId].Kverifiers) setPoT(modelId, models[modelId].counter[0]);
        return true;
    }

    function voteForVPC(bytes32 modelId, bool vote) public onlyVPCVerifier(modelId) returns(bool){
        require(!models[modelId].VPCVerifiers[msg.sender].exists, 'avoid replay attack');
        models[modelId].VPCVerifiers[msg.sender].vote = vote;
        models[modelId].VPCVerifiers[msg.sender].exists = true;
        if(models[modelId].VPCVerifiers[msg.sender].vote) models[modelId].counter[1] +=1;
        if(models[modelId].counter[1] == models[modelId].Kverifiers) setVPC(modelId, models[modelId].counter[1]);
        return true;
    }

    function setPoT(bytes32 serviceAgreementId, uint256 count) public onlyThisContract() returns(bool){
        bytes32 condition = serviceAgreementStorage.getConditionByFingerprint(serviceAgreementId, address(this), this.setPoT.selector);
        if (serviceAgreementStorage.hasUnfulfilledDependencies(serviceAgreementId, condition)){
            emit TrainingCondition(serviceAgreementId, false);
            return false;
        }
        if (serviceAgreementStorage.getConditionStatus(serviceAgreementId, condition) == 1) {
            emit TrainingCondition(serviceAgreementId, true);
            return true;
        }
        serviceAgreementStorage.fulfillCondition(serviceAgreementId, this.setPoT.selector, keccak256(abi.encodePacked(count)));
        emit TrainingCondition(serviceAgreementId, true);
        models[serviceAgreementId].isTrained = true;
        return true;
    }

    function setVPC(bytes32 serviceAgreementId, uint256 count) public onlyThisContract() returns(bool){
        bytes32 condition = serviceAgreementStorage.getConditionByFingerprint(serviceAgreementId, address(this), this.setVPC.selector);
        if (serviceAgreementStorage.hasUnfulfilledDependencies(serviceAgreementId, condition)){
            emit VerificationCondition(serviceAgreementId, false);
            return false;
        }
        if (serviceAgreementStorage.getConditionStatus(serviceAgreementId, condition) == 1) {
            emit VerificationCondition(serviceAgreementId, true);
            return true;
        }
        serviceAgreementStorage.fulfillCondition(serviceAgreementId, this.setVPC.selector, keccak256(abi.encodePacked(count)));
        emit VerificationCondition(serviceAgreementId, true);
        models[serviceAgreementId].isTrained = true;
        return true;
    }

    function freeMySlots(bytes32 modelId) public onlyVerifiers(modelId) returns(bool){
        uint slots = verifiers[msg.sender].slots;
        if(models[modelId].GPCVerifiers[msg.sender].exists && models[modelId].isTrained){
            addVerifierToRegistry(msg.sender);
            slots +=1;
        }
        if(models[modelId].VPCVerifiers[msg.sender].exists && models[modelId].isVerified){
            addVerifierToRegistry(msg.sender);
            slots +=1;
        }
        emit FreeSlots(msg.sender, slots);
        return true;
    }
}
