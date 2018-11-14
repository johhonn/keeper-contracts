pragma solidity ^0.4.25;

import 'openzeppelin-solidity/contracts/cryptography/ECDSA.sol';
import './ServiceAgreement.sol';

contract ComputeConditions {

    struct UploadProof {
        bool created;
        bool valid;
        bool locked;
        address dataScientist;
        bytes32 algorithmHash;
        bytes signature;
    }

    ServiceAgreement private serviceAgreementStorage;
    mapping (bytes32 => UploadProof) proofs;

    //events
    event SignatureSubmitted(bytes32 serviceAgreementId, address dataScientist, address publisher, bool state);
    event HashSubmitted(bytes32 serviceAgreementId, address dataScientist, address publisher, bool state);
    event ValidUploadProof(bytes32 serviceAgreementId, address dataScientist, address publisher, bool state);

    modifier onlyDataScientist(bytes32 serviceAgreementId) {
        require(msg.sender == serviceAgreementStorage.getServiceAgreementConsumer(serviceAgreementId), 'Invalid data scientist address!');
        _;
    }

    modifier onlyComputePublisher(bytes32 serviceAgreementId) {
        require(msg.sender == serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), 'Invalid publisher address');
        require(!proofs[serviceAgreementId].valid, 'avoid replay attack!');
        _;

    }

    modifier onlyStakeholders(bytes32 serviceAgreementId) {
        require(msg.sender == serviceAgreementStorage.getAgreementPublisher(serviceAgreementId) || msg.sender == serviceAgreementStorage.getServiceAgreementConsumer(serviceAgreementId), 'Access denied');
        require(!proofs[serviceAgreementId].valid, 'avoid replay attack');
        _;
    }

    constructor(address serviceAgreementAddress) public {
        require(serviceAgreementAddress != address(0), 'invalid service agreement contract address');
        serviceAgreementStorage = ServiceAgreement(serviceAgreementAddress);
    }


    function submitSignature(bytes32 serviceAgreementId, bytes signature) public onlyDataScientist(serviceAgreementId) returns(bool) {
        if(proofs[serviceAgreementId].created){
            if(proofs[serviceAgreementId].locked) { // avoid race conditions
                emit SignatureSubmitted(serviceAgreementId, serviceAgreementStorage.getServiceAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), false);
                return false;
            }
            proofs[serviceAgreementId].locked = true;
            proofs[serviceAgreementId].signature = signature;
            fulfillUpload(serviceAgreementId, true);
        }else{
            proofs[serviceAgreementId] = UploadProof(true, false, true, serviceAgreementStorage.getServiceAgreementConsumer(serviceAgreementId), bytes32(0), signature);
        }
        emit SignatureSubmitted(serviceAgreementId, serviceAgreementStorage.getServiceAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), true);
        proofs[serviceAgreementId].locked = false;
        return true;

    }

    function submitHash(bytes32 serviceAgreementId, bytes32 hash) public onlyComputePublisher(serviceAgreementId) returns(bool) {
        if(proofs[serviceAgreementId].created){
            if(proofs[serviceAgreementId].locked) { // avoid race conditions
                emit HashSubmitted(serviceAgreementId, serviceAgreementStorage.getServiceAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), false);
                return false;
            }
            proofs[serviceAgreementId].locked = true;
            proofs[serviceAgreementId].algorithmHash = hash;
            if(fulfillUpload(serviceAgreementId, true)){
                emit HashSubmitted(serviceAgreementId, serviceAgreementStorage.getServiceAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), false);
                return false;
            }
        }else{
            proofs[serviceAgreementId] = UploadProof(true, false, true, serviceAgreementStorage.getServiceAgreementConsumer(serviceAgreementId), hash, new bytes(0));
        }
        emit HashSubmitted(serviceAgreementId, serviceAgreementStorage.getServiceAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), true);
        proofs[serviceAgreementId].locked = false;
        return true;
    }

    function fulfillUpload(bytes32 serviceAgreementId, bool state) public onlyStakeholders(serviceAgreementId) returns(bool) {
        bytes32 condition = serviceAgreementStorage.getConditionByFingerprint(serviceAgreementId, address(this), this.fulfillUpload.selector);
        if (serviceAgreementStorage.hasUnfulfilledDependencies(serviceAgreementId, condition)){
            emit ValidUploadProof(serviceAgreementId, serviceAgreementStorage.getServiceAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), false);
            return false;
        }

        if (serviceAgreementStorage.getConditionStatus(serviceAgreementId, condition) == 1) {
            emit ValidUploadProof(serviceAgreementId, serviceAgreementStorage.getServiceAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), true);
            return true;
        }

        if(proofs[serviceAgreementId].dataScientist == ECDSA.recover(ECDSA.toEthSignedMessageHash(proofs[serviceAgreementId].algorithmHash), proofs[serviceAgreementId].signature)) {
            serviceAgreementStorage.fulfillCondition(serviceAgreementId, this.fulfillUpload.selector, keccak256(abi.encodePacked(state)));
            emit ValidUploadProof(serviceAgreementId, serviceAgreementStorage.getServiceAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), true);
            proofs[serviceAgreementId].valid = true;
            return true;
        }
        emit ValidUploadProof(serviceAgreementId, serviceAgreementStorage.getServiceAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), false);
        return false;
    }

}
