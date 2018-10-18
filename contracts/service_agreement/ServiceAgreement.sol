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
        uint256 [] flags;
    }
    // conditions id (templateId, contract address , function fingerprint)
    // it maps condition id to dependencies [uint256 is a compressed version]
    mapping(bytes32 => uint256) conditionKeyToIndex;

    struct Agreement{
        bool state; // instance of SLA status
        int8 [] conditionsState; // maps the condition status in the template
        bytes32 templateId; // referes to SLA template id
        address consumer;
        // condition Instance = [handler + value hash]
        bytes32 [] conditionInstances;
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
            require(agreements[serviceId].conditionsState[i] == 1);
        }
        _;
    }

    // check if the controller contract is authorized to change the condition state
    modifier isValidControllerHandler(bytes32 serviceId, bytes4 fingerprint, bytes32 valueHash) {
        bytes32 conditionKey = getConditionByFingerprint(serviceId, msg.sender, fingerprint);
        require(agreements[serviceId].conditionInstances[conditionKeyToIndex[conditionKey]] == keccak256(abi.encodePacked(conditionKey, valueHash)));
        require(!hasUnfulfilledDependencies(serviceId, conditionKey), "This condition has unfulfilled dependency");
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
    event SLATemplateRevoked(bytes32 templateId, bool state);

    // Setup service agreement template only once!
    function setupAgreementTemplate(address [] contracts, bytes4 [] fingerprints,
        uint256 [] dependencies, uint256 [] flags, bytes32 service) public returns (bool){
        // TODO: whitelisting the contracts/fingerprints
        require(contracts.length == fingerprints.length, "fingerprints and contracts length don't match");
        require(contracts.length == dependencies.length, "contracts and dependencies don't match");
        // 1. generate service ID
        bytes32 templateId =  keccak256(abi.encodePacked(msg.sender, service, dependencies.length, contracts.length));
        // 2. generate conditions
        bytes32 condition;
        templates[templateId] = ServiceAgreementTemplate(true, msg.sender, new bytes32 [](0), dependencies, flags);
        for (uint256 i=0; i< contracts.length; i++){
            condition = keccak256(abi.encodePacked(templateId, contracts[i], fingerprints[i]));
            templates[templateId].conditionKeys.push(condition);
            conditionKeyToIndex[condition] = i;
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

    function executeAgreement(bytes32 templateId, bytes signature, address consumer, bytes32 [] valueHash) public
        isOwner(templateId) returns (bool) {
        // check if the template is not revoked
        require(templates[templateId].state == true);
        // reconstruct the template fingerprint and check the consumer signature
        bytes32 hash = keccak256(abi.encodePacked(templateId, templates[templateId].conditionKeys, valueHash));
        bytes32 prefixedHash = generatePrefixHash(hash);
        // verify consumer's signature and notify actors the execution of agreement
        bytes32 serviceAgreementId = keccak256(abi.encodePacked(templateId, consumer, block.timestamp));
        if(isValidSignature(prefixedHash, signature, consumer)){
            int8 [] storage states;
            bytes32 [] storage instances;
            for(uint256 i=0; i < templates[templateId].conditionKeys.length; i++){
                states.push(-1);
                bytes32 condition = keccak256(abi.encodePacked(templates[templateId].conditionKeys[i], valueHash[i]));
                instances.push(condition);
                emit ExecuteCondition(serviceAgreementId, condition, false , templates[templateId].owner, consumer);
            }
            agreements[serviceAgreementId] = Agreement(false, states, templateId, consumer, instances);
            templateId2Agreements[templateId].push(serviceAgreementId);
            emit ExecuteAgreement(serviceAgreementId, templateId, false, templates[templateId].owner, consumer, true);
            states.length = 0;
            instances.length = 0;
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

    function isDependantOnIndex(uint256 dependencyValue, uint256 index) pure private returns (bool) {
        return (dependencyValue & (2**index) != 0);
    }

    function fulfillAgreement(bytes32 serviceId)
        noPendingFulfillments(serviceId) public returns(bool){
        // TODO: handle OR for agreement terminate
        agreements[serviceId].state = true;
        emit AgreementFulfilled(serviceId, agreements[serviceId].templateId, templates[agreements[serviceId].templateId].owner);
        return true;
    }

    function setConditionStatus(bytes32 serviceId, bytes4 fingerprint, bytes32 valueHash, int8 state) isValidControllerHandler(serviceId, fingerprint, valueHash)
        public returns (bool){
        bytes32 conditionKey = keccak256(abi.encodePacked(agreements[serviceId].templateId, msg.sender, fingerprint));
        agreements[serviceId].conditionsState[conditionKeyToIndex[conditionKey]] = state;
        emit ConditionFulfilled(serviceId, agreements[serviceId].templateId, conditionKey);
        return true;
    }

    function revokeAgreementTemplate(bytes32 templateId) isOwner(templateId) canRevokeTemplate(templateId) public returns(bool) {
        templates[templateId].state = false;
        emit SLATemplateRevoked(templateId, true);
    }

    function getTemplateId(bytes32 serviceId) view public returns(bytes32 templateId){
        return agreements[serviceId].templateId;
    }

    function getTemplateStatus(bytes32 templateId) view public returns(bool status){
        return templates[templateId].state;
    }

    function hasUnfulfilledDependencies(bytes32 serviceId, bytes32 condition) view public returns(bool status) {
        // TODO: process the dependency (based on flags)
        uint dependenciesValue = templates[agreements[serviceId].templateId].dependencies[conditionKeyToIndex[condition]];
        uint dependenciesFlag = templates[agreements[serviceId].templateId].flags[conditionKeyToIndex[condition]];
        // check the dependency conditions
        if(dependenciesValue == 0){
            return false;
        }
        for (uint i=0; i < templates[agreements[serviceId].templateId].conditionKeys.length; i++) {
            flag = (dependenciesFlag & (2**index) != 0); // != 0 means the bit for this ith condition is 1 (true)
            if(isDependantOnIndex(dependenciesValue, i)) {
                if (flag != agreements[serviceId].conditionsState[i]){
                    return true;
                }
                // TODO: Handle the unknown state (-1)
                // Discussed using an exit state/condition that can be specified at the dependency level. This exist
                // state determines the behaviour when a dependency has an unknown state.

            }
        }
        return false;
    }

    function getConditionStatus(bytes32 serviceId, bytes32 condition) view public returns(int8){
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

    function getConditionByFingerprint(bytes32 serviceId, address _contract, bytes4 fingerprint) public view returns (bytes32) {
        return keccak256(abi.encodePacked(getTemplateId(serviceId), _contract, fingerprint));
    }


}
