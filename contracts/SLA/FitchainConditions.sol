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
        bool isVerified;
        bool isTrained;
        bytes32 result;
        address consumer;
        address provider;
        mapping(address => bool) verifiers;
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
    uint256 private minStake;
    ServiceAgreement private serviceAgreementStorage;


    modifier onlyProvider(bytes32 modelId){
        require(models[modelId].exists, 'model does not exist!');
        require(msg.sender == models[modelId].provider, 'invalid model provider');
        _;
    }

    modifier onlyVerifier(bytes32 modelId){
        require(verifiers[msg.sender].isStaking, 'invalid staking verifier');
        require(models[modelId].exists, 'model does not exist!');
        require(models[modelId].verifiers[msg.sender], 'access denied invalid verifier address');
        _;
    }

    modifier onlyValidStakeValue(uint256 amount, uint256 slots){
        require(amount > 0 && slots > 0, 'invalid amount or slots values');
        // TODO: check if verifier has the same amount of tokens
        _;
    }

    constructor(address serviceAgreementAddress, uint256 _minStake) public {
        require(serviceAgreementAddress != address(0), 'invalid service agreement contract address');
        require(minStake > 0, 'invalid staking amount');
        serviceAgreementStorage = ServiceAgreement(serviceAgreementAddress);
        minStake = _minStake;

    }

    function registerVerifier(uint256 amount, uint slots) public onlyValidStakeValue(amount, slots) returns(bool){
        // TODO: cut this stake from his balance
        verifiers[msg.sender].isStaking = true;
        verifiers[msg.sender].amount = amount * slots;
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
}
