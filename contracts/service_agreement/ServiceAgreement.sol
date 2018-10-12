pragma solidity ^0.4.25;


contract ServiceAgreement {

    modifier noPendingFulfillments (bytes32 serviceTemplateId){
        // TODO:
        _;
    }

    modifier isValidControllerFunction(bytes32 serviceId, bytes4 fingerprint) {

        // TODO:
        _;
    }

    function setupAgreement(address [] contracts, bytes4 [] fingerprints, string service) public returns (bool);

    function executeAgreement(bytes32 serviceTemplateId, bytes signature, address consumer) public returns(bool);

    function revokeAgreement(bytes32 serviceTemplateId) noPendingFulfillments(serviceTemplateId) public returns(bool);

    function setConditionStatus(bytes32 serviceId, bytes4 fingerprint) isValidControllerFunction(serviceId, fingerprint) public returns (bool);

    function getConditionStatus(bytes32 conditionId) view public returns(bool);

    function getAgreementStatus(bytes32 serviceId) view public returns(bool);

}
