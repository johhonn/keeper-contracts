pragma solidity ^0.4.25;


contract ServiceAgreement {

    struct ServiceAgreementTemplate{
        bool state; // 1->Established 0-> revoked serviceTemplateId
        address owner; // template owner
        bytes32 [] conditionKeys; // we use this arrary in order to preserve the order in the condition state (check Service Agreement struct)
    }
    // conditions id (templateId, contract address , function fingerprint)
    // it maps condition id to dependencies [uint256 is a compressed version]
    mapping(bytes32 => uint256) conditions;

    struct Agreement{
        bool state; // instance of SLA status
        bool [] conditionsState; // maps the condition status in the template
        bytes32 templateId; // referes to SLA template id
    }

    mapping (bytes32 => ServiceAgreementTemplate) templates;
    // instances of SLA template
    mapping (bytes32 => Agreement) agreements;


    modifier noPendingFulfillments(bytes32 serviceTemplateId){

        _;
    }

    modifier isValidControllerHandler(bytes32 serviceId, bytes4 fingerprint) {

        _;
    }

    modifier isOwner(bytes32 templateId, address consumer){
        require(templates[templateId].owner == msg.sender);
        require(consumer != msg.sender);
        _;
    }

    // events
    event SetupCondition(bytes32 serviceTemplate, bytes32 condition, address provider);
    event SetupAgreementTemplate(bytes32 serviceTemplateId, address provider);
    event ExecuteCondition(bytes32 serviceId, bytes32 condition, bool status, address templateOwner, address consumer);
    event ExecuteAgreement(bytes32 serviceId, bytes32 templateId, bool status, address templateOwner, address consumer);

    // Setup service agreement template only once!
    function setupAgreementTemplate(address [] contracts, bytes4 [] fingerprints,
        uint256 [] dependencies, bytes32 service) public returns (bool){
        // TODO: whitelisting the contracts/fingerprints
        require(contracts.length == fingerprints.length, "fingerprints and contracts length don't match");
        require(contracts.length == dependencies.length, "contracts and dependencies don't match");
        // 1. generate service ID
        bytes32 templateId =  keccak256(abi.encodePacked(msg.sender, service, dependencies.length, contracts.length));
        // 2. generate conditions
        bytes32 condition;
        templates[templateId] = ServiceAgreementTemplate(true, msg.sender, new bytes32 [](0));
        for (uint256 i=0; i< contracts.length; i++){
            condition = keccak256(abi.encodePacked(templateId, contracts[i], fingerprints[i]));
            templates[templateId].conditionKeys.push(condition);
            conditions[condition] = dependencies[i];
            emit SetupCondition(templateId, condition, msg.sender);
        }
        emit SetupAgreementTemplate(templateId, msg.sender);
        return true;
    }

    function isValidSignature(bytes32 hash, bytes signature, address consumer) private pure returns(bool){
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        return (consumer == ecrecover(hash,v, r, s));
    }


    function executeAgreement(bytes32 templateId, bytes signature, address consumer) public
        isOwner(templateId, consumer) returns (bool) {
        // verify consumer's signature
        bytes32 hash = keccak256(abi.encodePacked(templateId, templates[templateId].conditionKeys));
        require(isValidSignature(hash, signature, consumer));
        // create new instance of service agreement template
        bytes32 serviceAgreementId = keccak256(abi.encodePacked(templateId, consumer, block.timestamp));
        bool [] memory states;
        for(uint256 i=0; i < templates[templateId].conditionKeys.length; i++){
            states[i] = false;
            emit ExecuteCondition(serviceAgreementId, templates[templateId].conditionKeys[i], false , templates[templateId].owner, consumer);
        }
        agreements[serviceAgreementId] = Agreement(false, states, templateId);
        emit ExecuteAgreement(serviceAgreementId, templateId, false, templates[templateId].owner, consumer);
    }

    function splitSignature(bytes signature) private pure returns (uint8 v, bytes32 r, bytes32 s) {
        // Check the signature length
        require (signature.length == 65);
        // inline assembly code for splitting signature into r, v , and s.
        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(signature, 32))
            // second 32 bytes
            s := mload(add(signature, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(signature, 96)))
        }
        // check the version
        if (v < 27) {
             v += 27;
        }
        return (v, r, s);
    }

}
