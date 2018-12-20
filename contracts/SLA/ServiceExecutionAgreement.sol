pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/cryptography/ECDSA.sol';

/**
@title Ocean Protocol Service Level Agreement
@author Team: Ahmed Ali, Samer Sallam
*/

contract ServiceExecutionAgreement {

    struct Template {
        bool state; // 1 -> Available 0 -> revoked template
        address owner; // template owner
        bytes32[] conditionKeys; // preserving the order in the condition state
        uint256[] dependenciesBits; // 1st bit --> dependency, 2nd bit --> timeout flag (enabled/disabled)
        uint8[] fulfillmentIndices; // if conditions true accept as this agreement as fulfiled agreement
        uint8 fulfillmentOperator; // 0 --> AND, 1--> OR, N--> M-of-N
    }

    mapping(bytes32 => Template) templates;
    // instances of SLA template

    struct ServiceAgreement {
        bool state; // instance of SLA status
        bool nonce; // avoid replay attack
        bool terminated;
        uint8[] conditionsState; // maps the condition status in the template
        uint8[] conditionLockedState; // maps the condition status in the template
        bytes32 templateId; // refers to SLA template id
        address consumer;
        address publisher;
        bytes32[] conditionInstances; // condition Instance = [handler + value hash]
        uint256[] timeoutValues; // in terms of block number not sec!
        bytes32 did; // Decentralized Identifier
    }

    mapping(bytes32 => ServiceAgreement) serviceAgreements;

    // map template Id to a list of agreement instances
    mapping(bytes32 => bytes32[]) templateIdToServiceAgreements;

    // conditions id (templateId, contract address , function fingerprint)
    // it maps condition id to dependencies [uint256 is a compressed version]
    mapping(bytes32 => uint256) conditionKeyToIndex;

    // is able to revoke agreement template (template is no longer accessible)
    modifier canRevokeTemplate(bytes32 templateId){
        bytes32[] storage serviceAgreementIds = templateIdToServiceAgreements[templateId];
        for (uint256 i = 0; i < serviceAgreementIds.length; i++) {
            require(
                serviceAgreements[serviceAgreementIds[i]].state == true,
                'Owner can not revoke template!');
        }
        _;
    }

    // check if the no longer pending unfulfilled conditions in the SLA
    modifier noPendingFulfillments(bytes32 serviceAgreementId){
        ServiceAgreement storage serviceAgreement = serviceAgreements[serviceAgreementId];
        Template storage template = templates[getTemplateId(serviceAgreementId)];

        if(template.fulfillmentOperator == 0){
            for (uint256 i=0; i < template.fulfillmentIndices.length; i++) {
                require(
                    serviceAgreement.conditionsState[template.fulfillmentIndices[i]] == 1,
                    'Indicating one of the fulfillment conditions is false');
            }
        }
        else {
            uint8 N = 0;
            for(uint256 j=0; j < template.fulfillmentIndices.length; j++) {
                if(serviceAgreement.conditionsState[template.fulfillmentIndices[j]] == 1) N += 1;
            }
            if(template.fulfillmentOperator == 1) {
                // OR operator (1 of M), N = 1
                require(
                    N == 1,
                    'Indicating all fulfillment conditions are false');
            }
            if (template.fulfillmentOperator > 1) {
                require(
                    N >= template.fulfillmentOperator,
                    'Indicating N of M fulfillment conditions are false');
            }
        }
        _;
    }

    // check if the controller contract is authorized to change the condition state
    modifier isValidControllerHandler(bytes32 serviceAgreementId,
                                      bytes4 fingerprint,
                                      bytes32 valueHash) {
        bytes32 conditionKey = generateConditionKeyForId(serviceAgreementId,
                                                         msg.sender,
                                                         fingerprint);
        bytes32 conditionHash = hashCondition(conditionKey, valueHash);
        uint256 conditionIndex = conditionKeyToIndex[conditionKey];
        ServiceAgreement storage serviceAgreement = serviceAgreements[serviceAgreementId];

        require(
            serviceAgreement.conditionInstances[conditionIndex] == conditionHash,
            'unable to reconstruct the right condition hash'
        );
        require(
            serviceAgreement.conditionLockedState[conditionIndex] == 0,
            'This condition is locked, access denied.');
        require(
            !hasUnfulfilledDependencies(serviceAgreementId, conditionKey),
            'This condition has unfulfilled dependency');
        _;
    }

    // is the sender authorized to create instance of the SLA template
    modifier isTemplateOwner(bytes32 templateId){
        require(
            templates[templateId].owner == msg.sender,
            'Not a template owner');
        _;
    }

    // validate agreement execution request
    modifier isValidExecuteRequest(bytes32 templateId,
                                   bytes32 serviceAgreementId) {
        require(
            templates[templateId].state == true,
            'Template is revoked');
        require(
            !serviceAgreements[serviceAgreementId].nonce,
            'Indicating Replay attack');
        _;
    }

    modifier isValidTemplateId(bytes32 templateId) {
        require(
            !templates[templateId].state,
            'Template ID already exists');
        _;
    }

    modifier onlyExistConditionKey(bytes32 serviceAgreementId,
                                   bytes32 condition){
        Template storage template = templates[serviceAgreements[serviceAgreementId].templateId];
        uint256 conditionIndex = conditionKeyToIndex[condition];
        require(
            template.conditionKeys[conditionIndex] == condition,
            'Invalid condition key');
        _;
    }

    // events
    event TemplateSetup(
        bytes32 serviceTemplateId,
        address provider);

    event TemplateRevoked(
        bytes32 templateId,
        bool state);

    event ConditionSetup(
        bytes32 serviceTemplate,
        bytes32 condition,
        address provider);

    event ConditionExecuted(
        bytes32 serviceAgreementId,
        bytes32 condition,
        bytes32 did,
        bool status,
        address templateOwner,
        address consumer);

    event ConditionFulfilled(
        bytes32 serviceAgreementId,
        bytes32 templateId,
        bytes32 condition);

    event ServiceAgreementExecuted(
        bytes32 serviceAgreementId,
        bytes32 templateId,
        bytes32 did,
        bool status,
        address templateOwner,
        address consumer);

    event ServiceAgreementFulfilled(
        bytes32 serviceAgreementId,
        bytes32 templateId,
        address owner);

    // Setup service agreement template only once!
    function setupTemplate(bytes32 templateId,
                           address[] contracts,
                           bytes4[] fingerprints,
                           uint256[] dependenciesBits,
                           uint8[] fulfillmentIndices,
                           uint8 fulfillmentOperator)
    public isValidTemplateId(templateId)
    returns (bool){
        // TODO: whitelisting the contracts/fingerprints
        require(
            contracts.length == fingerprints.length,
            'fingerprints and contracts length do not match');
        require(
            contracts.length == dependenciesBits.length,
            'contracts and dependencies do not match');
        require(
            fulfillmentIndices.length <= contracts.length,
            'Invalid fulfillment indices');
        require(
            fulfillmentOperator <= fulfillmentIndices.length,
            'Invalid fulfillment operator');
        // 2. generate conditions
        templates[templateId] = Template(
            true,
            msg.sender,
            new bytes32[](0),
            dependenciesBits,
            fulfillmentIndices,
            fulfillmentOperator);

        for (uint256 i = 0; i < contracts.length; i++) {
            bytes32 conditionKey = generateConditionKey(templateId, contracts[i], fingerprints[i]);
            templates[templateId].conditionKeys.push(conditionKey);
            conditionKeyToIndex[conditionKey] = i;
            emit ConditionSetup(templateId, conditionKey, msg.sender);
        }
        emit TemplateSetup(templateId, msg.sender);
        return true;
    }

    function revokeTemplate(bytes32 templateId)
    public isTemplateOwner(templateId) canRevokeTemplate(templateId)
    returns (bool) {
        templates[templateId].state = false;
        emit TemplateRevoked(templateId, true);
    }

    function getTemplateOwner(bytes32 templateId)
    public view
    returns (address owner) {
        return templates[templateId].owner;
    }

    function getTemplateId(bytes32 serviceAgreementId)
    public view
    returns (bytes32 templateId){
        return serviceAgreements[serviceAgreementId].templateId;
    }

    function getTemplateStatus(bytes32 templateId)
    public view
    returns (bool status){
        return templates[templateId].state;
    }

    function initConditions(bytes32 templateId,
                            bytes32 serviceAgreementId,
                            bytes32[] valueHash,
                            uint256[] timeoutValues,
                            bytes32 did)
    private
    returns (bool) {
        ServiceAgreement storage serviceAgreement = serviceAgreements[serviceAgreementId];

        for (uint256 i = 0; i < templates[templateId].conditionKeys.length; i++) {
            if (timeoutValues[i] != 0) {
                // TODO: define dynamic margin
                require(
                    timeoutValues[i] > 2,
                    'invalid timeout with a margin (~ 30 to 40 seconds = 2 blocks intervals) to avoid race conditions'
                );
                serviceAgreement.timeoutValues.push(block.timestamp + timeoutValues[i]);
            } else {
                serviceAgreement.timeoutValues.push(0);
            }
            serviceAgreement.conditionsState.push(0);
            serviceAgreement.conditionLockedState.push(0);

            // add condition instance
            bytes32 conditionKey = hashCondition(templates[templateId].conditionKeys[i], valueHash[i]);
            serviceAgreement.conditionInstances.push(conditionKey);

            emit ConditionExecuted(
                serviceAgreementId,
                conditionKey,
                did,
                false,
                templates[templateId].owner,
                serviceAgreement.consumer
            );
        }

        return true;
    }

    function hashCondition(bytes32 conditionKey,
                           bytes32 valueHash)
    public pure
    returns (bytes32){
        return keccak256(abi.encodePacked(conditionKey, valueHash));
    }

    function generateConditionKey(bytes32 templateId,
                                  address contractAddress,
                                  bytes4 fingerprint)
    public pure
    returns (bytes32){
        return keccak256(abi.encodePacked(templateId, contractAddress, fingerprint));
    }

    function generateConditionKeyForId(bytes32 serviceAgreementId,
                                       address contractAddress,
                                       bytes4 fingerprint)
    public view
    returns (bytes32) {
        return generateConditionKey(
            getTemplateId(serviceAgreementId),
            contractAddress,
            fingerprint);
    }

    function getConditionStatus(bytes32 serviceAgreementId,
                                bytes32 condition)
    public onlyExistConditionKey(serviceAgreementId, condition) view
    returns (uint8){
        return serviceAgreements[serviceAgreementId]
            .conditionsState[conditionKeyToIndex[condition]];
    }

    function executeServiceAgreement(bytes32 templateId,
                                     bytes signature,
                                     address consumer,
                                     bytes32[] valueHashes,
                                     uint256[] timeoutValues,
                                     bytes32 serviceAgreementId,
                                     bytes32 did)
    public isValidExecuteRequest(templateId, serviceAgreementId)
    returns (bool) {
        require(
            timeoutValues.length == templates[templateId].conditionKeys.length,
            'invalid timeout values length');
        Template storage slaTemplate = templates[templateId];

        // reconstruct the agreement fingerprint and check the consumer signature
        // embedding `serviceAgreementId` in signature as nonce generated by consumer to block Replay-attack
        bytes32 prefixedHash = prefixHash(hashServiceAgreement(
            templateId,
            slaTemplate.conditionKeys,
            valueHashes,
            timeoutValues,
            serviceAgreementId));
        // verify consumer's signature and trigger the execution of agreement
        require(
            isValidSignature(prefixedHash, signature, consumer),
            'Invalid consumer signature of service agreement');

        serviceAgreements[serviceAgreementId] = ServiceAgreement(
            false,
            true,
            false,
            new uint8[](0),
            new uint8[](0),
            templateId,
            consumer,
            msg.sender,
            new bytes32[](0),
            new uint256[](0),
            did);

        require(
            initConditions(
                templateId,
                serviceAgreementId,
                valueHashes,
                timeoutValues,
                did),
            'unable to init conditions');

        templateIdToServiceAgreements[templateId].push(serviceAgreementId);

        emit ServiceAgreementExecuted(
            serviceAgreementId,
            templateId,
            did,
            false,
            slaTemplate.owner,
            consumer);

        return true;
    }

    function fulfillServiceAgreement(bytes32 serviceAgreementId)
    public noPendingFulfillments(serviceAgreementId)
    returns (bool){
        ServiceAgreement storage serviceAgreement = serviceAgreements[serviceAgreementId];
        serviceAgreement.state = true;
        serviceAgreement.terminated = true;
        emit ServiceAgreementFulfilled(
            serviceAgreementId,
            serviceAgreement.templateId,
            templates[serviceAgreement.templateId].owner);
        return true;
    }

    function hashServiceAgreement(bytes32 templateId,
                                  bytes32[] conditionKeys,
                                  bytes32[] valueHashes,
                                  uint256[] timeoutValues,
                                  bytes32 serviceAgreementId)
    public pure
    returns (bytes32){
        return keccak256(abi.encodePacked(
            templateId,
            conditionKeys,
            valueHashes,
            timeoutValues,
            serviceAgreementId));
    }

    function isServiceAgreementTerminated(bytes32 serviceAgreementId)
    public view
    returns(bool) {
        return serviceAgreements[serviceAgreementId].terminated;
    }

    function getServiceAgreementState(bytes32 serviceAgreementId)
    public view
    returns (bool){
        return serviceAgreements[serviceAgreementId].state;
    }

    function getServiceAgreementPublisher(bytes32 serviceAgreementId)
    public view
    returns (address publisher) {
        return serviceAgreements[serviceAgreementId].publisher;
    }

    function getServiceAgreementConsumer(bytes32 serviceAgreementId)
    public view
    returns (address consumer){
        return serviceAgreements[serviceAgreementId].consumer;
    }

    function fulfillCondition(bytes32 serviceAgreementId,
                              bytes4 fingerprint,
                              bytes32 valueHash)
    public isValidControllerHandler(serviceAgreementId,
                                    fingerprint,
                                    valueHash)
    returns (bool){

        ServiceAgreement storage serviceAgreement = serviceAgreements[serviceAgreementId];
        bytes32 conditionKey = generateConditionKey(serviceAgreement.templateId, msg.sender, fingerprint);
        serviceAgreement.conditionsState[conditionKeyToIndex[conditionKey]] = 1;
        // Lock dependencies of this condition
        uint dependenciesValue = templates[serviceAgreement.templateId]
            .dependenciesBits[conditionKeyToIndex[conditionKey]];
        if (dependenciesValue != 0) {
            lockChildConditions(serviceAgreementId, conditionKey, dependenciesValue);
        }
        emit ConditionFulfilled(
            serviceAgreementId,
            serviceAgreement.templateId,
            conditionKey);
        return true;
    }

    function lockChildConditions(bytes32 serviceAgreementId,
                                 bytes32 condition,
                                 uint256 dependenciesValue)
    private {
        // check the dependency conditions
        ServiceAgreement storage serviceAgreement = serviceAgreements[serviceAgreementId];
        for (uint16 i = 0; i < templates[serviceAgreement.templateId].conditionKeys.length; i++) {
            if (getBitValue(dependenciesValue, i, 0, 2) != 0) {
                // This is a dependency, lock it
                // verify its state is either 1 or has timed out
                uint8 timeoutFlag = getBitValue(dependenciesValue, i, 1, 2);
                require(
                    (serviceAgreement.conditionsState[i] == 1)
                    || ((timeoutFlag == 1) && conditionTimedOut(serviceAgreementId, condition)),
                    'Invalid state, child dependency expected to be fulfilled or parent timeout occurred.');
                serviceAgreement.conditionLockedState[i] = 1;
            }
        }
    }

    function hasUnfulfilledDependencies(bytes32 serviceAgreementId,
                                        bytes32 condition)
    public view
    returns (bool status) {
        ServiceAgreement storage serviceAgreement = serviceAgreements[serviceAgreementId];
        Template storage template = templates[serviceAgreement.templateId];
        uint dependenciesValue = template
            .dependenciesBits[conditionKeyToIndex[condition]];
        // check the dependency conditions
        if (dependenciesValue == 0) {
            return false;
        }
        for (uint16 i = 0; i < template.conditionKeys.length; i++) {
            if (getBitValue(dependenciesValue, i, 0, 2) != 0) {
                uint8 timeoutFlag = getBitValue(dependenciesValue, i, 1, 2);
                if (timeoutFlag == 1) {
                    if (serviceAgreement.conditionsState[i] == 1
                        || !conditionTimedOut(serviceAgreementId, condition)) {
                        return true;
                    }
                } else if (serviceAgreement.conditionsState[i] == 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function conditionTimedOut(bytes32 serviceAgreementId, bytes32 condition)
    public view
    returns (bool){
        if (block.timestamp > serviceAgreements[serviceAgreementId]
            .timeoutValues[conditionKeyToIndex[condition]])
            return true;
        return false;
    }

    function getCurrentBlockNumber()
    public view
    returns (uint){
        return block.number;
    }

    function prefixHash(bytes32 hash)
    public pure
    returns (bytes32){
        return ECDSA.toEthSignedMessageHash(hash);
    }


    function isValidSignature(bytes32 hash, bytes signature, address consumer)
    public pure
    returns (bool){
        return (consumer == recoverAddress(hash, signature));
    }

    function recoverAddress(bytes32 hash, bytes signature)
    public pure
    returns (address){
        return ECDSA.recover(hash, signature);
    }

    function getBitValue(uint256 value,
                         uint16 i,
                         uint16 bitPosition,
                         uint16 numBits)
    private pure
    returns (uint8 bitValue) {
        return uint8(value & (2 ** uint256((i * numBits) + bitPosition))) == 0 ? uint8(0) : uint8(1);
    }

}
