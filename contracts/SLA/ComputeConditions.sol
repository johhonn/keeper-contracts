pragma solidity ^0.4.25;

import 'openzeppelin-solidity/contracts/cryptography/ECDSA.sol';
import './ServiceAgreement.sol';

/// @title On-premise compute conditions
/// @author Ocean Protocol Team
/// @notice This contract is WIP, don't use if for production
/// @dev All function calls are currently implement without side effects

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

    /// @notice submitSignature is called only by the data-scientist address.
    /// @dev At first It checks if the proof state is created or not then checks that the hash
    /// has been submitted by the publisher in order to call fulfillUpload. This preserves
    /// the message integrity and proof that both parties agree on the same algorithm file/s
    /// @param serviceAgreementId , the service level agreement Id
    /// @param signature data scientist signature = signed_hash(uploaded_algorithm_file/s)
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

    /// @notice submitHash is called only by the on-premise address.
    /// @dev At first It checks if the proof state is created or not then checks if the signature
    /// has been submitted by the data scientist in order to call fulfillUpload. This preserves
    /// the message integrity and proof that both parties agree on the same algorithm file/s
    /// @param serviceAgreementId the service level agreement Id
    /// @param hash = kekccak(uploaded_algorithm_file/s)
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

    /// @notice fulfillUpload is called by anyone of the stakeholders [publisher or data scientist]
    /// @dev check if there are unfulfilled dependency condition, if false, it verifies the signature
    /// using the submitted hash (by publisher), the signature (by data scientist) then call
    /// fulfillCondition in service level agreement storage contract
    /// @param serviceAgreementId the service level agreement Id
    /// @param state get be used fo input value hash for this condition indicating the state of verification
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
