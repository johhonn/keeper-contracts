pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/cryptography/ECDSA.sol';

/**
@title Ocean Protocol Service Execution Agreement
@author Team: Ahmed Ali, Samer Sallam
**/

contract ServiceExecutionAgreement {

    struct Template {
        bool isAvailable; // 1 -> Available 0 -> revoked template
        address owner; // template owner
        bytes32[] conditionKeys; // preserving the order in the condition state
        uint256[] dependenciesBits; // 1st bit --> dependency, 2nd bit --> timeout flag (enabled/disabled)
        uint8[] fulfillmentIndices; // if conditions true accept as this agreement as fulfilled agreement
        uint8 fulfillmentOperator; // 0 --> AND, 1--> OR, N--> M-of-N
    }

    mapping(bytes32 => Template) private templates;
    // instances of SEA Template

    struct Agreement {
        bool isAvailable; // instance of SEA status
        bool isExisting; // avoid replay attack
        bool isTerminated; // is this service agreement terminated or not
        uint8[] conditionsState; // maps the condition status in the template
        uint8[] conditionLockedState; // maps the condition status in the template
        bytes32 templateId; // refers to SEA template id
        address consumer;
        address publisher;
        bytes32[] conditionInstances; // condition Instance = [handler + value hash]
        uint256[] timeoutValues; // in terms of block number not sec!
        bytes32 did; // Decentralized Identifier
    }

    mapping(bytes32 => Agreement) private agreements;

    // map template Id to a list of agreement instances
    mapping(bytes32 => bytes32[]) private templateIdToAgreements;

    // conditions id (templateId, contract address , function fingerprint)
    // it maps condition id to dependencies [uint256 is a compressed version]
    mapping(bytes32 => uint256) private conditionKeyToIndex;

    // is able to revoke agreement template (template is no longer accessible)
    modifier canRevokeTemplate(bytes32 templateId) {
        bytes32[] storage agreementIds = templateIdToAgreements[templateId];
        for (uint256 i = 0; i < agreementIds.length; i++) {
            require(
                agreements[agreementIds[i]].isAvailable == true,
                'Owner can not revoke template!');
        }
        _;
    }

    // check if the no longer pending unfulfilled conditions in the SEA
    modifier noPendingFulfillments(bytes32 agreementId) {
        Agreement storage agreement = agreements[agreementId];
        Template storage template = templates[getTemplateId(agreementId)];

        if (template.fulfillmentOperator == 0) {
            for (uint256 i = 0; i < template.fulfillmentIndices.length; i++) {
                require(
                    agreement.conditionsState[template.fulfillmentIndices[i]] == 1,
                    'Indicating one of the fulfillment conditions is false');
            }
        }
        else {
            uint8 N = 0;
            for (uint256 j = 0; j < template.fulfillmentIndices.length; j++) {
                if (agreement.conditionsState[template.fulfillmentIndices[j]] == 1) N += 1;
            }
            if (template.fulfillmentOperator == 1) {
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
    modifier isValidControllerHandler(
        bytes32 agreementId,
        bytes4 fingerprint,
        bytes32 valueHash
    )
    {
        bytes32 conditionKey = generateConditionKeyForId(
            agreementId,
            msg.sender,
            fingerprint);
        bytes32 conditionHash = hashCondition(conditionKey, valueHash);
        uint256 conditionIndex = conditionKeyToIndex[conditionKey];
        Agreement storage agreement = agreements[agreementId];

        require(
            agreement.conditionInstances[conditionIndex] == conditionHash,
            'unable to reconstruct the right condition hash'
        );
        require(
            agreement.conditionLockedState[conditionIndex] == 0,
            'This condition is locked, access denied.');
        require(
            !hasUnfulfilledDependencies(agreementId, conditionKey),
            'This condition has unfulfilled dependency');
        _;
    }

    // is the sender authorized to create instance of the SEA template
    modifier isTemplateOwner(bytes32 templateId) {
        require(
            templates[templateId].owner == msg.sender,
            'Not a template owner');
        _;
    }

    // validate agreement execution request
    modifier isValidExecuteRequest(
        bytes32 templateId,
        bytes32 agreementId
    ) {
        require(
            templates[templateId].isAvailable == true,
            'Template is revoked');
        require(
            !agreements[agreementId].isExisting,
            'Service Agreement ist already existing, Indicating Replay attack');
        _;
    }

    modifier isValidTemplateId(bytes32 templateId) {
        require(
            !templates[templateId].isAvailable,
            'Template ID already exists');
        _;
    }

    modifier onlyExistConditionKey(
        bytes32 agreementId,
        bytes32 condition
    )
    {
        Template storage template = templates[agreements[agreementId].templateId];
        uint256 conditionIndex = conditionKeyToIndex[condition];
        require(
            template.conditionKeys[conditionIndex] == condition,
            'Invalid condition key');
        _;
    }

    // events
    event TemplateSetup(
        bytes32 templateId,
        address provider
    );

    event TemplateRevoked(
        bytes32 templateId,
        bool isAvailable
    );

    event ConditionSetup(
        bytes32 templateId,
        bytes32 condition,
        address provider
    );

    event ConditionExecuted(
        bytes32 agreementId,
        bytes32 condition,
        bytes32 did,
        bool status,
        address templateOwner,
        address consumer
    );

    event ConditionFulfilled(
        bytes32 agreementId,
        bytes32 templateId,
        bytes32 condition
    );

    event AgreementExecuted(
        bytes32 agreementId,
        bytes32 templateId,
        bytes32 did,
        bool status,
        address templateOwner,
        address consumer
    );

    event AgreementFulfilled(
        bytes32 agreementId,
        bytes32 templateId,
        address owner
    );

    // Setup service agreement template only once!
    function setupTemplate(
        bytes32 templateId,
        address[] contracts,
        bytes4[] fingerprints,
        uint256[] dependenciesBits,
        uint8[] fulfillmentIndices,
        uint8 fulfillmentOperator
    )
        public
        isValidTemplateId(templateId)
        returns (
            bool templateSetup
        )
    {
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
        public
        isTemplateOwner(templateId)
        canRevokeTemplate(templateId)
        returns (
            bool templateRevoked
        )
    {
        templates[templateId].isAvailable = false;
        emit TemplateRevoked(templateId, true);
        return true;
    }

    function getTemplateOwner(bytes32 templateId) public view returns (address owner)
    {
        return templates[templateId].owner;
    }

    function getTemplateId(bytes32 agreementId) public view returns (bytes32 templateId)
    {
        return agreements[agreementId].templateId;
    }

    /// @notice deprecated use isTemplateAvailable instead
    function getTemplateStatus(bytes32 templateId) public view returns (bool status)
    {
        return isTemplateAvailable(templateId);
    }

    function isTemplateAvailable(bytes32 templateId) public view returns (bool status)
    {
        return templates[templateId].isAvailable;
    }

    function initializeAgreement(
        bytes32 templateId,
        bytes signature,
        address consumer,
        bytes32[] valueHashes,
        uint256[] timeoutValues,
        bytes32 agreementId,
        bytes32 did
    )
        public
        isValidExecuteRequest(
            templateId,
            agreementId
        )
        returns (
            bool agreementExecuted
        )
    {
        require(
            timeoutValues.length == templates[templateId].conditionKeys.length,
            'invalid timeout values length');
        Template storage slaTemplate = templates[templateId];

        // reconstruct the agreement fingerprint and check the consumer signature
        // embedding `agreementId` in signature as nonce generated by consumer to block Replay-attack
        bytes32 prefixedHash = prefixHash(
            hashAgreement(
                templateId,
                slaTemplate.conditionKeys,
                valueHashes,
                timeoutValues,
                agreementId
            )
        );
        // verify consumer's signature and trigger the execution of agreement
        require(
            isValidSignature(prefixedHash, signature, consumer),
            'Invalid consumer signature of service agreement');

        agreements[agreementId] = Agreement(
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
            initializeConditions(
                templateId,
                agreementId,
                valueHashes,
                timeoutValues,
                did),
            'unable to init conditions'
        );

        templateIdToAgreements[templateId].push(agreementId);

        emit AgreementExecuted(
            agreementId,
            templateId,
            did,
            false,
            slaTemplate.owner,
            consumer
        );

        return true;
    }

    function fulfillAgreement(bytes32 agreementId)
        public
        noPendingFulfillments(agreementId)
        returns (
            bool agreementFulfilled
        )
    {
        Agreement storage agreement = agreements[agreementId];
        agreement.isAvailable = true;
        agreement.isTerminated = true;
        emit AgreementFulfilled(
            agreementId,
            agreement.templateId,
            templates[agreement.templateId].owner);
        return true;
    }

    function hashAgreement(
        bytes32 templateId,
        bytes32[] conditionKeys,
        bytes32[] valueHashes,
        uint256[] timeoutValues,
        bytes32 agreementId
    )
        public pure
        returns (
            bytes32 agreementHash
        )
    {
        return keccak256(
            abi.encodePacked(
                templateId,
                conditionKeys,
                valueHashes,
                timeoutValues,
                agreementId
            )
        );
    }

    function getAgreementPublisher(bytes32 agreementId)
        public view
        returns (
            address publisher
        )
    {
        return agreements[agreementId].publisher;
    }

    function getAgreementConsumer(bytes32 agreementId)
        public view
        returns (
            address consumer
        )
    {
        return agreements[agreementId].consumer;
    }

    function isAgreementTerminated(bytes32 agreementId)
        public view
        returns(
            bool isTerminated
        )
    {
        return agreements[agreementId].isTerminated;
    }

    function isAgreementAvailable(bytes32 agreementId)
        public view
        returns (
            bool isAvailable
        )
    {
        return agreements[agreementId].isAvailable;
    }

    function initializeConditions(
        bytes32 templateId,
        bytes32 agreementId,
        bytes32[] valueHash,
        uint256[] timeoutValues,
        bytes32 did
    )
        private
        returns (
            bool conditionInitiated
        )
    {
        Agreement storage agreement = agreements[agreementId];

        for (uint256 i = 0; i < templates[templateId].conditionKeys.length; i++) {
            if (timeoutValues[i] != 0) {
                // TODO: define dynamic margin
                require(
                    timeoutValues[i] > 2,
                    'invalid timeout with a margin (~ 30 to 40 seconds = 2 blocks intervals) to avoid race conditions'
                );
                agreement.timeoutValues.push(block.timestamp + timeoutValues[i]);
            } else {
                agreement.timeoutValues.push(0);
            }
            agreement.conditionsState.push(0);
            agreement.conditionLockedState.push(0);

            // add condition instance
            bytes32 conditionKey = hashCondition(templates[templateId].conditionKeys[i], valueHash[i]);
            agreement.conditionInstances.push(conditionKey);

            emit ConditionExecuted(
                agreementId,
                conditionKey,
                did,
                false,
                templates[templateId].owner,
                agreement.consumer
            );
        }

        return true;
    }

    function fulfillCondition(
        bytes32 agreementId,
        bytes4 fingerprint,
        bytes32 valueHash
    )
        public
        isValidControllerHandler(
            agreementId,
            fingerprint,
            valueHash
        )
        returns (
            bool isConditionFulfilled
        )
    {

        Agreement storage agreement = agreements[agreementId];
        bytes32 conditionKey = generateConditionKey(agreement.templateId, msg.sender, fingerprint);
        agreement.conditionsState[conditionKeyToIndex[conditionKey]] = 1;
        // Lock dependencies of this condition
        uint dependenciesValue = templates[agreement.templateId]
            .dependenciesBits[conditionKeyToIndex[conditionKey]];
        if (dependenciesValue != 0) {
            lockChildConditions(agreementId, conditionKey, dependenciesValue);
        }
        emit ConditionFulfilled(
            agreementId,
            agreement.templateId,
            conditionKey
        );
        return true;
    }

    function getConditionStatus(
        bytes32 agreementId,
        bytes32 condition
    )
        public
        onlyExistConditionKey(
            agreementId,
            condition
        )
        view
        returns (
            uint8 conditionStatus
        )
    {
        return agreements[agreementId]
            .conditionsState[conditionKeyToIndex[condition]];
    }

    function hashCondition(
        bytes32 conditionKey,
        bytes32 valueHash
    )
        public pure
        returns (
            bytes32 conditionHash
        )
    {
        return keccak256(abi.encodePacked(conditionKey, valueHash));
    }

    function generateConditionKey(
        bytes32 templateId,
        address contractAddress,
        bytes4 fingerprint
    )
        public pure
        returns (
            bytes32 conditionKey
        )
    {
        return keccak256(
            abi.encodePacked(
                templateId,
                contractAddress,
                fingerprint
            )
        );
    }

    function generateConditionKeyForId(
        bytes32 agreementId,
        address contractAddress,
        bytes4 fingerprint
    )
        public view
        returns (
            bytes32 conditionKey
    )
    {
        return generateConditionKey(
            getTemplateId(agreementId),
            contractAddress,
            fingerprint);
    }

    function lockChildConditions(
        bytes32 agreementId,
        bytes32 condition,
        uint256 dependenciesValue
    )
        private
    {
        // check the dependency conditions
        Agreement storage agreement = agreements[agreementId];
        for (uint16 i = 0; i < templates[agreement.templateId].conditionKeys.length; i++) {
            if (getBitValue(dependenciesValue, i, 0, 2) != 0) {
                // This is a dependency, lock it
                // verify its state is either 1 or has timed out
                uint8 timeoutFlag = getBitValue(dependenciesValue, i, 1, 2);
                require(
                    agreement.conditionsState[i] == 1 ||
                    (
                        timeoutFlag == 1 &&
                        conditionTimedOut(agreementId, condition)
                    ),
                    'Invalid state, child dependency expected to be fulfilled or parent timeout occurred.'
                );
                agreement.conditionLockedState[i] = 1;
            }
        }
    }

    function hasUnfulfilledDependencies(
        bytes32 agreementId,
        bytes32 condition
    )
        public view
        returns (bool)
    {
        Agreement storage agreement = agreements[agreementId];
        Template storage template = templates[agreement.templateId];
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
                    if (agreement.conditionsState[i] == 1 ||
                        !conditionTimedOut(agreementId, condition)) {
                        return true;
                    }
                } else if (agreement.conditionsState[i] == 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function conditionTimedOut(bytes32 agreementId, bytes32 condition)
        public view
        returns (bool timedOut)
    {
        if (block.timestamp > agreements[agreementId]
            .timeoutValues[conditionKeyToIndex[condition]])
            return true;
        return false;
    }

    function getCurrentBlockNumber()
        public view
        returns (uint blockNumber)
    {
        return block.number;
    }

    function prefixHash(bytes32 hash)
        public pure
        returns (bytes32 prefixedHash)
    {
        return ECDSA.toEthSignedMessageHash(hash);
    }

    function isValidSignature(
        bytes32 hash,
        bytes signature,
        address consumer
    )
        public pure
        returns (bool isValid)
    {
        return (consumer == recoverAddress(hash, signature));
    }

    function recoverAddress(bytes32 hash, bytes signature)
        public pure
        returns (
            address recoveredAddress
        )
    {
        return ECDSA.recover(hash, signature);
    }

    function getBitValue(
        uint256 value,
        uint16 i,
        uint16 bitPosition,
        uint16 numBits
    )
        private pure
        returns (
            uint8 bitValue
        )
    {
        return uint8(value & (2 ** uint256((i * numBits) + bitPosition))) == 0 ? uint8(0) : uint8(1);
    }

}
