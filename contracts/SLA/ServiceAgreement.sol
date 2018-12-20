pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/cryptography/ECDSA.sol';

/// @title Ocean Protocol Service Level Agreement
/// @author Ocean Protocol Team


contract ServiceAgreement {

    struct ServiceAgreementTemplate {
        bool state; // 1 -> Available 0 -> revoked template
        address owner; // template owner
        bytes32[] conditionKeys; // preserving the order in the condition state
        uint256[] dependenciesBits; // 1st bit --> dependency, 2nd bit --> timeout flag (enabled/disabled)
        uint8[] fulfillmentIndices; // if conditions true accept as this agreement as fulfiled agreement
        uint8 fulfillmentOperator; // 0 --> AND, 1--> OR, N--> M-of-N
    }
    // conditions id (templateId, contract address , function fingerprint)
    // it maps condition id to dependencies [uint256 is a compressed version]
    mapping(bytes32 => uint256) conditionKeyToIndex;

    struct Agreement {
        bool state; // instance of SLA status
        bool nonce; // avoid replay attack
        bool terminated;
        uint8[] conditionsState; // maps the condition status in the template
        uint8[] conditionLockedState; // maps the condition status in the template
        bytes32 templateId; // referes to SLA template id
        address consumer;
        address publisher;
        bytes32[] conditionInstances; // condition Instance = [handler + value hash]
        uint256[] timeoutValues; // in terms of block number not sec!
        bytes32 did; // Decentralized Identifier
    }

    mapping(bytes32 => ServiceAgreementTemplate) templates;
    // instances of SLA template
    mapping(bytes32 => Agreement) agreements;

    // map template Id to a list of agreement instances
    mapping(bytes32 => bytes32[]) templateId2Agreements;

    // is able to revoke agreement template (template is no longer accessible)
    modifier canRevokeTemplate(bytes32 templateId){
        for (uint256 i = 0; i < templateId2Agreements[templateId].length; i++) {
            require(agreements[templateId2Agreements[templateId][i]].state == true, 'Owner can not revoke template!');
        }
        _;
    }

    // check if the no longer pending unfulfilled conditions in the SLA
    modifier noPendingFulfillments(bytes32 serviceId){
        if(templates[getTemplateId(serviceId)].fulfillmentOperator == 0){
            for (uint256 i=0; i < templates[getTemplateId(serviceId)].fulfillmentIndices.length; i++) {
                require(agreements[serviceId].conditionsState[templates[getTemplateId(serviceId)].fulfillmentIndices[i]] == 1, 'Indicating one of the fulfillment conditions is false');
            }
        }
        else {
            uint8 N = 0;
            for(uint256 j=0; j < templates[getTemplateId(serviceId)].fulfillmentIndices.length; j++) {
                if(agreements[serviceId].conditionsState[templates[getTemplateId(serviceId)].fulfillmentIndices[j]] == 1) N += 1;
            }
            if(templates[getTemplateId(serviceId)].fulfillmentOperator == 1) {
                // OR operator (1 of M), N =1
                require(N == 1, 'Indicating all fulfillment conditions are false');
            }
            if (templates[getTemplateId(serviceId)].fulfillmentOperator > 1) {
                require(N >= templates[getTemplateId(serviceId)].fulfillmentOperator, 'Indicating N of M fulfillment conditions are false');
            }
        }
        _;
    }

    // check if the controller contract is authorized to change the condition state
    modifier isValidControllerHandler(bytes32 serviceId, bytes4 fingerprint, bytes32 valueHash) {
        bytes32 conditionKey = getConditionByFingerprint(serviceId, msg.sender, fingerprint);
        require(
            agreements[serviceId].conditionInstances[conditionKeyToIndex[conditionKey]] ==
            keccak256(abi.encodePacked(conditionKey, valueHash)),
            'unable to reconstruct the right condition hash'
        );
        require(agreements[serviceId].conditionLockedState[conditionKeyToIndex[conditionKey]] == 0, 'This condition is locked, access denied.');
        require(!hasUnfulfilledDependencies(serviceId, conditionKey), 'This condition has unfulfilled dependency');
        _;
    }

    // is the sender authorized to create instance of the SLA template
    modifier isTemplateOwner(bytes32 templateId){
        require(templates[templateId].owner == msg.sender, 'Not a template owner');
        _;
    }

    // validate agreement executation request
    modifier isValidExecuteRequest(bytes32 templateId, bytes32 serviceAgreementId) {
        require(templates[templateId].state == true, 'Template is revoked');
        require(!agreements[serviceAgreementId].nonce, 'Indicating Replay attack');
        _;
    }

    // check if template id is not exist
    modifier isValidTemplateId(bytes32 templateId) {
        require(!templates[templateId].state, 'Template ID already exists');
        _;
    }

    // check if the condition key is already exist on the service execution agreement instance
    modifier onlyExistConditionKey(bytes32 serviceAgreementId, bytes32 condition){
        require(templates[agreements[serviceAgreementId].templateId].conditionKeys[conditionKeyToIndex[condition]] == condition, 'Invalid condition key');
        _;
    }

    // events
    event SetupCondition(bytes32 serviceTemplate, bytes32 condition, address provider);
    event SetupAgreementTemplate(bytes32 serviceTemplateId, address provider);
    event ExecuteCondition(bytes32 serviceAgreementId, bytes32 condition, bytes32 did, bool status, address templateOwner, address consumer);
    event ExecuteAgreement(bytes32 serviceAgreementId, bytes32 templateId, bytes32 did, bool status, address templateOwner, address consumer);
    event ConditionFulfilled(bytes32 serviceAgreementId, bytes32 templateId, bytes32 condition);
    event AgreementFulfilled(bytes32 serviceAgreementId, bytes32 templateId, address owner);
    event SLATemplateRevoked(bytes32 templateId, bool state);

    /// @notice setupAgreementTemplate setup service agreement template (only once)
    /// @dev requires some initial checks before deploying template on-chain
    /// @param templateId , unique identifier for template
    /// @param contracts , array of condition contracts that have the fulfillment functions
    /// @param fingerprints , array of 4 bytes of (fulfillment) function selectors
    /// @param dependenciesBits , describes the dependency model which embeds or encode in the template conditions relationships
    /// @param service , hash of service agreement name (defined in off-chain DID document)
    /// @param fulfillmentIndices , fulfillment indices include which conditions are in charge to make the agreement fulfilled
    /// @param fulfillmentOperator , the relation between conditions in the fulfillment indices
    function setupAgreementTemplate(bytes32 templateId, address[] contracts, bytes4[] fingerprints, uint256[] dependenciesBits, bytes32 service, uint8[] fulfillmentIndices, uint8 fulfillmentOperator)
    public isValidTemplateId(templateId) returns (bool){
        // TODO: whitelisting the contracts/fingerprints
        require(contracts.length == fingerprints.length, 'fingerprints and contracts length do not match');
        require(contracts.length == dependenciesBits.length, 'contracts and dependencies do not match');
        require(fulfillmentIndices.length <= contracts.length, 'Invalid fulfillment indices');
        require(fulfillmentOperator <= fulfillmentIndices.length, 'Invalid fulfillment operator');
        // 2. generate conditions
        templates[templateId] = ServiceAgreementTemplate(true, msg.sender, new bytes32[](0), dependenciesBits, fulfillmentIndices, fulfillmentOperator);
        for (uint256 i = 0; i < contracts.length; i++) {
            templates[templateId].conditionKeys.push(keccak256(abi.encodePacked(templateId, contracts[i], fingerprints[i])));
            conditionKeyToIndex[keccak256(abi.encodePacked(templateId, contracts[i], fingerprints[i]))] = i;
            emit SetupCondition(templateId, keccak256(abi.encodePacked(templateId, contracts[i], fingerprints[i])), msg.sender);
        }
        emit SetupAgreementTemplate(templateId, msg.sender);
        return true;
    }

    /// @notice isValidSignature checks if signature is valid
    /// @dev mainly this function meant to be generic function for ethereum based signature validation
    /// @param hash , hash of the message
    /// @param signature , signed hash
    /// @param consumer , the consumer or the actor address
    /// @return true if the signature is valid
    function isValidSignature(bytes32 hash, bytes signature, address consumer) public pure returns (bool){
        return (consumer == ECDSA.recover(hash, signature));
    }

    /// @notice initConditions private function which initialize conditions before creating new service agreement instance
    /// @dev validates timeout values, init condition states and condition locks, then creates new conditions instances
    /// by combining the condition key with the corresponding value hash
    /// @param templateId , the on-chain template ID
    /// @param serviceAgreementId , service agreement instance ID
    /// @param valueHash , the hash of all values in the DID document
    /// @param timeoutValues , time out values if exist (0 is default)
    /// @param did , registered DID document
    /// @return true if the condition initialization goes well
    function initConditions(bytes32 templateId, bytes32 serviceAgreementId, bytes32[] valueHash, uint256[] timeoutValues, bytes32 did) private returns (bool) {
        for (uint256 i = 0; i < templates[templateId].conditionKeys.length; i++) {
            if (timeoutValues[i] != 0) {
                // TODO: define dynamic margin
                require(
                    timeoutValues[i] > 2,
                    'invalid timeout with a margin (~ 30 to 40 seconds = 2 blocks intervals) to avoid race conditions'
                );
                agreements[serviceAgreementId].timeoutValues.push(block.timestamp + timeoutValues[i]);
            } else {
                agreements[serviceAgreementId].timeoutValues.push(0);
            }
            agreements[serviceAgreementId].conditionsState.push(0);
            agreements[serviceAgreementId].conditionLockedState.push(0);

            // add condition instance
            agreements[serviceAgreementId].conditionInstances.push(keccak256(abi.encodePacked(templates[templateId].conditionKeys[i], valueHash[i])));
            emit ExecuteCondition(
                serviceAgreementId, keccak256(abi.encodePacked(templates[templateId].conditionKeys[i], valueHash[i])), did,
                false, templates[templateId].owner, agreements[serviceAgreementId].consumer
            );
        }

        return true;
    }

    /// @notice executeAgreement once service agreement template is created, this function enable users to create new instances of the agreement
    /// @dev validates the timeout length, reconstruct the agreement fingerprint and check the consumer signature, it also embeds
    /// `serviceAgreementId` in signature as nonce generated by consumer to block Replay-attack
    /// @param templateId , the on-chain template ID
    /// @param signature , signature of the consumer indicating that he/she agreed on the values for the conditions
    /// @param consumer , the consumer address
    /// @param valueHashes , the hash of all values in the DID document
    /// @param timeoutValues , time values if exist (zero is the default value)
    /// @param serviceAgreementId , service agreement instance ID
    /// @return true if the service execution template instantiation goes well
    function executeAgreement(bytes32 templateId, bytes signature, address consumer, bytes32[] valueHashes, uint256[] timeoutValues, bytes32 serviceAgreementId, bytes32 did) public
    isValidExecuteRequest(templateId, serviceAgreementId) returns (bool) {
        require(timeoutValues.length == templates[templateId].conditionKeys.length, 'invalid timeout values length');
        ServiceAgreementTemplate storage slaTemplate = templates[templateId];
        bytes32 agreementHash = keccak256(abi.encodePacked(templateId, slaTemplate.conditionKeys, valueHashes, timeoutValues, serviceAgreementId));
        // verify consumer's signature
        require(
            isValidSignature(ECDSA.toEthSignedMessageHash(agreementHash), signature, consumer),
            'Invalid consumer signature of service agreement'
        );
        agreements[serviceAgreementId] = Agreement(
            false, true, false, new uint8[](0), new uint8[](0), templateId, consumer, msg.sender, new bytes32[](0), new uint256[](0), did
        );
        require(initConditions(templateId, serviceAgreementId, valueHashes, timeoutValues, did), 'unable to init conditions');
        templateId2Agreements[templateId].push(serviceAgreementId);
        emit ExecuteAgreement(serviceAgreementId, templateId, did, false, slaTemplate.owner, consumer);
        return true;
    }

    /// @notice fulfillAgreement fulfils the agreement if all conditions are met
    /// @param serviceId , service execution agreement instance ID
    /// @return true if the all the conditions are met in a particular service execution agreement
    function fulfillAgreement(bytes32 serviceId) public noPendingFulfillments(serviceId) returns (bool){
        agreements[serviceId].state = true;
        agreements[serviceId].terminated = true;
        emit AgreementFulfilled(serviceId, agreements[serviceId].templateId, templates[agreements[serviceId].templateId].owner);
        return true;
    }

    /// @notice fulfillCondition fulfils condition if everything is valid
    /// @param serviceId , service execution agreement instance ID
    /// @param fingerprint , 4 bytes function selector (only solidity external/public functions)
    /// @param valueHash , the keccak256 of the all values that have been used to fulfill the condition
    /// @return true if the value hash and the condition key constructed using the right values
    function fulfillCondition(bytes32 serviceId, bytes4 fingerprint, bytes32 valueHash)
    public isValidControllerHandler(serviceId, fingerprint, valueHash) returns (bool){
        bytes32 conditionKey = keccak256(abi.encodePacked(agreements[serviceId].templateId, msg.sender, fingerprint));
        agreements[serviceId].conditionsState[conditionKeyToIndex[conditionKey]] = 1;
        // Lock dependencies of this condition
        uint dependenciesValue = templates[agreements[serviceId].templateId].dependenciesBits[conditionKeyToIndex[conditionKey]];
        if (dependenciesValue != 0) {
            lockChildConditions(serviceId, conditionKey, dependenciesValue);
        }
        emit ConditionFulfilled(serviceId, agreements[serviceId].templateId, conditionKey);
        return true;
    }

    function getTemplateId(bytes32 serviceId) public view returns (bytes32 templateId){
        return agreements[serviceId].templateId;
    }

    /// @notice getBitValue is a utility function runs bitwise operation to extracts the condition parameter value
    /// @param value , dependencies values
    /// @param i , condition index
    /// @param bitPosition , which bit position will be checked
    /// @param numBits , currently the number of bits used in this implementation is 2 but it might be extended in the future to hold more features
    function getBitValue(uint256 value, uint16 i, uint16 bitPosition, uint16 numBits) private pure returns (uint8 bitValue) {
        return uint8(value & (2 ** uint256((i * numBits) + bitPosition))) == 0 ? uint8(0) : uint8(1);
    }

    /// @notice lockChildConditions is a utility function which mainly locks the condition to avoid re-entrancy attack for this condition
    /// @param serviceId , service execution agreement instance ID
    /// @param condition , condition key (not condition instance)
    function lockChildConditions(bytes32 serviceId, bytes32 condition, uint256 dependenciesValue) private {
        // check the dependency conditions
        for (uint16 i = 0; i < templates[agreements[serviceId].templateId].conditionKeys.length; i++) {
            if (getBitValue(dependenciesValue, i, 0, 2) != 0) {
                // This is a dependency, lock it
                // verify its state is either 1 or has timed out
                uint8 timeoutFlag = getBitValue(dependenciesValue, i, 1, 2);
                require((agreements[serviceId].conditionsState[i] == 1) || ((timeoutFlag == 1) && conditionTimedOut(serviceId, condition)), 'Invalid state, child dependency expected to be fulfilled or parent timeout occurred.');
                agreements[serviceId].conditionLockedState[i] = 1;
            }
        }
    }

    /// @notice hasUnfulfilledDependencies returns true if all dependency conditions of this condition are fully fulfilled
    /// @param serviceId , service execution agreement instance ID
    /// @param condition , condition key (not condition instance)
    /// @return true if all dependency conditions of this condition are fully fulfilled
    function hasUnfulfilledDependencies(bytes32 serviceId, bytes32 condition) public view returns (bool status) {
        uint dependenciesValue = templates[agreements[serviceId].templateId].dependenciesBits[conditionKeyToIndex[condition]];
        // check the dependency conditions
        if (dependenciesValue == 0) {
            return false;
        }
        for (uint16 i = 0; i < templates[agreements[serviceId].templateId].conditionKeys.length; i++) {
            if (getBitValue(dependenciesValue, i, 0, 2) != 0) {
                uint8 timeoutFlag = getBitValue(dependenciesValue, i, 1, 2);
                if (timeoutFlag == 1) {
                    if (agreements[serviceId].conditionsState[i] == 1 || !conditionTimedOut(serviceId, condition)) {
                        return true;
                    }
                } else if (agreements[serviceId].conditionsState[i] == 0) {
                    return true;
                }
            }
        }
        return false;
    }

    /// @notice conditionTimedOut returns true if the condition timeout
    /// @param serviceId , service execution agreement instance ID
    /// @param condition , condition key (not condition instance)
    function conditionTimedOut(bytes32 serviceId, bytes32 condition) public view returns (bool){
        if (block.timestamp > agreements[serviceId].timeoutValues[conditionKeyToIndex[condition]]) return true;
        return false;
    }

    /// @notice getCurrentBlockNumber returns the current block number in ocean network
    function getCurrentBlockNumber() public view returns (uint){
        return block.number;
    }

    /// @notice getConditionStatus returns condition status
    /// @param serviceId , service execution agreement instance ID
    /// @param condition , condition key (not condition instance)
    function getConditionStatus(bytes32 serviceId, bytes32 condition) public onlyExistConditionKey(serviceId, condition) view returns (uint8){
        return agreements[serviceId].conditionsState[conditionKeyToIndex[condition]];
    }

    /// @notice getAgreementStatus returns service execution agreement status
    /// @param serviceId , service execution agreement instance ID
    function getAgreementStatus(bytes32 serviceId) public view returns (bool){
        return agreements[serviceId].state;
    }

    /// @notice getAgreementPublisher returns publisher address in a service execution agreement
    /// @param serviceId , service agreement instance ID
    function getAgreementPublisher(bytes32 serviceId) public view returns (address publisher) {
        return agreements[serviceId].publisher;
    }

    /// @notice getTemplateOwner returns address of the service execution agreement template owner
    /// @param templateId , service execution agreement template ID
    function getTemplateOwner(bytes32 templateId) public view returns (address owner) {
        return templates[templateId].owner;
    }

    /// @notice getAgreementConsumer returns the address of service execution agreement consumer
    /// @param serviceId , service agreement instance ID
    function getAgreementConsumer(bytes32 serviceId) public view returns (address consumer){
        return agreements[serviceId].consumer;
    }

    /// @notice getConditionByFingerprint returns condition key
    /// @param serviceId , service agreement instance ID
    /// @param _contract , condition fulfillment contract address
    /// @param fingerprint , condition fulfillment function fingerprint (4 bytes) ONLY external or public fulfillment functions
    function getConditionByFingerprint(bytes32 serviceId, address _contract, bytes4 fingerprint) public view returns (bytes32) {
        return keccak256(abi.encodePacked(getTemplateId(serviceId), _contract, fingerprint));
    }

    /// @notice isAgreementTerminated returns service execution agreement status
    /// @param serviceAgreementId , service agreement instance ID
    function isAgreementTerminated(bytes32 serviceAgreementId) public view returns(bool) {
        return agreements[serviceAgreementId].terminated;
    }

    /// @notice getTemplateStatus returns service execution agreement status
    /// @param templateId , service execution agreement template ID
    function getTemplateStatus(bytes32 templateId) public view returns (bool status){
        return templates[templateId].state;
    }

    /// @notice revokeAgreementTemplate revokes the template agreement, so it is no longer will be used in the future
    /// @param templateId , service execution agreement template ID
    function revokeAgreementTemplate(bytes32 templateId) public isTemplateOwner(templateId) canRevokeTemplate(templateId) returns (bool) {
        templates[templateId].state = false;
        emit SLATemplateRevoked(templateId, true);
    }

    /// @notice revokeAgreementTemplate revokes the template agreement, so it is no longer will be used in the future
    /// @param templateId , service execution agreement template ID
    function getTemplateConditionKey(bytes32 templateId, uint index) view public returns (bytes32) {
        require(index < templates[templateId].conditionKeys.length);
        return templates[templateId].conditionKeys[index];
    }

    /// @notice revokeAgreementTemplate revokes the template agreement, so it is no longer will be used in the future
    /// @param templateId , service execution agreement template ID
    function getTemplateDependencies(bytes32 templateId, uint index) view public returns (uint256) {
        require(index < templates[templateId].dependenciesBits.length);
        return templates[templateId].dependenciesBits[index];
    }
}
