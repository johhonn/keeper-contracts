pragma solidity 0.4.25;

/**
@title Ocean Protocol Service Level Agreement
@author Team: Ahmed Ali, Samer Sallam
*/

contract ServiceAgreement {

    struct ServiceAgreementTemplate{
        bool state; // 1->Established 0-> revoked serviceTemplateId
        address owner; // template owner
        bytes32 [] conditionKeys; // preserving the order in the condition state (check Agreement struct)
        uint256 [] dependencies;
    }
    // conditions id (templateId, contract address , function fingerprint)
    // it maps condition id to dependencies [uint256 is a compressed version]
    mapping(bytes32 => uint32) conditionKeyToIndex;

    struct Agreement{
        bool state; // instance of SLA status
        bool [] conditionsState; // maps the condition status in the template
        bytes32 templateId; // referes to SLA template id
        address consumer;
    }

    mapping (bytes32 => ServiceAgreementTemplate) templates;
    // instances of SLA template
    mapping (bytes32 => Agreement) agreements;

    // map template Id to a list of agreement instances
    mapping(bytes32 => bytes32[]) templateId2Agreements;

    // is able to revoke agreement template (template is no longer accessible)
    modifier canRevokeTemplate(bytes32 templateId){
        for (uint256 i=0; i < templateId2Agreements[templateId].length; i++){
            require (agreements[templateId2Agreements[templateId][i]].state == true);
        }
        _;
    }

    // check if the no longer pending unfulfilled conditions in the SLA
    modifier noPendingFulfillments(bytes32 serviceId){
        for (uint256 i=0; i< agreements[serviceId].conditionsState.length; i++){
            require(agreements[serviceId].conditionsState[i] == true);
        }
        _;
    }

    // check if the controller contract is authorized to change the condition state
    modifier isValidControllerHandler(bytes32 serviceId, bytes4 fingerprint) {
        bytes32 condition = keccak256(abi.encodePacked(agreements[serviceId].templateId, msg.sender, fingerprint));
        require(getDependencyStatus(serviceId, condition));
        _;
    }

    // is the sender authorized to create instance of the SLA template
    modifier isOwner(bytes32 templateId){
        require(templates[templateId].owner == msg.sender);
        _;
    }

    // events
    event SetupCondition(bytes32 serviceTemplate, bytes32 condition, address provider);
    event SetupAgreementTemplate(bytes32 serviceTemplateId, address provider);
    event ExecuteCondition(bytes32 serviceId, bytes32 condition, bool status, address templateOwner, address consumer);
    event ExecuteAgreement(bytes32 serviceId, bytes32 templateId, bool status, address templateOwner, address consumer, bool state);
    event ConditionFulfilled(bytes32 serviceId, bytes32 templateId, bytes32 condition);
    event AgreementFulfilled(bytes32 serviceId, bytes32 templateId, address owner);

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
        templates[templateId] = ServiceAgreementTemplate(true, msg.sender, new bytes32 [](0), dependencies);
        for (uint256 i=0; i< contracts.length; i++){
            condition = keccak256(abi.encodePacked(templateId, contracts[i], fingerprints[i]));
            templates[templateId].conditionKeys.push(condition);
            conditionKeyToIndex[condition] = uint32(i);
            emit SetupCondition(templateId, condition, msg.sender);
        }
        emit SetupAgreementTemplate(templateId, msg.sender);
        return true;
    }

    function isValidSignature(bytes32 hash, bytes signature, address consumer) private pure returns(bool){
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        return (consumer == ecrecover(hash,v, r, s));
    }


    function generatePrefixHash(bytes32 hash) pure private returns(bytes32 prefixedHash) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(prefix, hash));
    }

    function executeAgreement(bytes32 templateId, bytes signature, address consumer) public
        isOwner(templateId) returns (bool) {
        // check if the template is not revoked
        require(templates[templateId].state == true);
        // reconstruct the template fingerprint and check the consumer signature
        bytes32 hash = keccak256(abi.encodePacked(templateId, templates[templateId].conditionKeys));
        bytes32 prefixedHash = generatePrefixHash(hash);
        // verify consumer's signature and notify actors the execution of agreement
        bytes32 serviceAgreementId = keccak256(abi.encodePacked(templateId, consumer, block.timestamp));
        if(isValidSignature(prefixedHash, signature, consumer)){
            bool [] storage states;
            for(uint256 i=0; i < templates[templateId].conditionKeys.length; i++){
                states.push(false);
                emit ExecuteCondition(serviceAgreementId, templates[templateId].conditionKeys[i], false , templates[templateId].owner, consumer);
            }
            agreements[serviceAgreementId] = Agreement(false, states, templateId, consumer);
            templateId2Agreements[templateId].push(serviceAgreementId);
            emit ExecuteAgreement(serviceAgreementId, templateId, false, templates[templateId].owner, consumer, true);
            states.length = 0;
         }else{
            emit ExecuteAgreement(serviceAgreementId, templateId, false, templates[templateId].owner, consumer, false);
         }
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

    function isDependantOnIndex(uint dependencyValue, uint index) pure private returns (bool) {
        return (dependencyValue & (2**index) == 1);
    }

    function fulfillAgreement(bytes32 serviceId)
        noPendingFulfillments(serviceId) public returns(bool){
        agreements[serviceId].state = true;
        emit AgreementFulfilled(serviceId, agreements[serviceId].templateId, templates[agreements[serviceId].templateId].owner);
        return true;
    }

    function setConditionStatus(bytes32 serviceId, bytes4 fingerprint) isValidControllerHandler(serviceId, fingerprint)
        public returns (bool){

        bytes32 condition = keccak256(abi.encodePacked(agreements[serviceId].templateId, msg.sender, fingerprint));
        agreements[serviceId].conditionsState[conditionKeyToIndex[condition]] = true;
        emit ConditionFulfilled(serviceId, agreements[serviceId].templateId, condition);
        return true;
    }

    function revokeAgreementTemplate(bytes32 templateId) isOwner(templateId) canRevokeTemplate(templateId) public returns(bool) {
        templates[templateId].state = false;
    }

    function getDependencyStatus(bytes32 serviceId, bytes32 condition) view public returns(bool status) {
        uint dependenciesValue = templates[agreements[serviceId].templateId].dependencies[conditionKeyToIndex[condition]];
        // check the dependency conditions
        status = false;
        if(dependenciesValue != 0){
            for (uint i=0; i < templates[agreements[serviceId].templateId].conditionKeys.length; i++) {
                if(!isDependantOnIndex(dependenciesValue, i) || agreements[serviceId].conditionsState[i]){
                    status= true;
                }
                if(!status){
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    function getConditionStatus(bytes32 serviceId, bytes32 condition) view public returns(bool){
        return agreements[serviceId].conditionsState[conditionKeyToIndex[condition]];
    }

    function getAgreementStatus(bytes32 serviceId) view public returns(bool){
         return agreements[serviceId].state;
    }

    function getTemplateOwner(bytes32 templateId) view public returns (address owner){
        return templates[templateId].owner;
    }

    function getServiceAgreementConsumer(bytes32 serviceId) view public returns(address consumer){
        return agreements[serviceId].consumer;
    }

}
