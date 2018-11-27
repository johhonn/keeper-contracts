pragma solidity ^0.4.25;

import 'openzeppelin-solidity/contracts/cryptography/ECDSA.sol';
import './ServiceAgreement.sol';

/// @title On-premise compute conditions
/// @author Ahmed Ali
/// @notice This contract is WIP, don't use if for production
/// @dev All function calls are currently implement without side effects
/// TODO: Implementing commit-reveal approach to avoid the front-running

contract FitchainConditions{

    struct Model {
        bool exists;
        bool isTrained;
        bool isVerified;
        uint Kverifiers;
        bytes32 result;
        address consumer;
        address provider;
        mapping(address => bool) GPCVerifiers;
        mapping(address => bool) VPCVerifiers;
    }

    struct Verifier {
        bool isStaking;
        uint256 amount;
        uint256 slots;
        uint256 maxSlots;
        mapping(bytes32 => bool) models;
    }

    address[] verifiersRegistry;
    mapping(bytes32 => Model) models;
    mapping(address => Verifier) verifiers;
    uint256 private stake;
    ServiceAgreement private serviceAgreementStorage;

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
        require(models[modelId].GPCVerifiers[msg.sender], 'access denied invalid verifier address');
        _;
    }

    modifier onlyVPCVerifier(bytes32 modelId){
        require(verifiers[msg.sender].isStaking, 'invalid staking verifier');
        require(models[modelId].exists, 'model does not exist!');
        require(models[modelId].GPCVerifiers[msg.sender], 'access denied invalid verifier address');
        _;
    }

    modifier onlyValidStakeValue(uint256 slots){
        require(slots > 0, 'invalid slots value');
        // TODO: check if verifier has the same amount of tokens
        _;
    }

    constructor(address serviceAgreementAddress, uint256 _stake) public {
        require(serviceAgreementAddress != address(0), 'invalid service agreement contract address');
        require(_stake > 0, 'invalid staking amount');
        serviceAgreementStorage = ServiceAgreement(serviceAgreementAddress);
        stake = _stake;

    }

    function registerVerifier(uint slots) public onlyValidStakeValue(slots) returns(bool){
        // TODO: cut this stake from the verifier's balance
        verifiers[msg.sender].isStaking = true;
        verifiers[msg.sender].amount = stake * slots;
        verifiers[msg.sender].slots = slots;
        verifiersRegistry.push(msg.sender);
        return true;
    }

    function electRRKVerifiers(uint k) private returns(address[] verifiersSet){
        if(verifiersRegistry.length < k) return verifiersSet;
        for(uint256 i=0; i <= k ; i++){
            if(verifiers[verifiersRegistry[i]].slots == 1){
                removeVerifierFromRegistry(verifiersRegistry[i]);
            }
            verifiersSet[i] = verifiersRegistry[i];
            verifiers[verifiersRegistry[i]].slots -=1;
        }
    }

    function addVerifierToRegistry(address verifier) private returns(bool){
        verifiersRegistry.push(verifier);
        return true;
    }

    function removeVerifierFromRegistry(address verifier)  private returns(bool) {
        for(uint256 j=0; j<verifiersRegistry.length; j++){
            if(verifier == verifiersRegistry[j]){
                for (uint i=j; i< verifiersRegistry.length-1; i++){
                    verifiersRegistry[i] = verifiersRegistry[i+1];
                }
                verifiersRegistry.length--;
                return true;
            }
        }
        return false;
    }

    function initPoTProof(bytes32 modelId, uint256 k) public onlyPublisher(modelId) returns(bool){
        require(k > 0, 'invalid verifiers number');
        models[modelId].exists = true;
        models[modelId].isTrained = false;
        models[modelId].isVerified = false;
        models[modelId].Kverifiers = k;
        models[modelId].consumer = serviceAgreementStorage.getServiceAgreementConsumer(modelId);
        models[modelId].provider = serviceAgreementStorage.getAgreementPublisher(modelId);
        // get k GPC verifiers
        address[] memory GPCVerifiers = electRRKVerifiers(k);
        if(GPCVerifiers.length < k){
            //TODO: emit event
            return false;
        }
        for(uint i=0; i< GPCVerifiers.length; i++){
            // set vote false
            models[modelId].GPCVerifiers[GPCVerifiers[i]] = false;
        }
        //TODO: emit event
        return true;
    }

    function initVPCProof(bytes32 modelId, uint256 k) public onlyPublisher(modelId) returns(bool){
        // get k GPC verifiers
        address[] memory VPCVerifiers = electRRKVerifiers(k);
        if(VPCVerifiers.length < k){
            //TODO: emit event
            return false;
        }
        for(uint i=0; i< VPCVerifiers.length; i++){
            // set vote false
            models[modelId].VPCVerifiers[VPCVerifiers[i]] = false;
        }
        //TODO: emit event
        return true;
    }
}
