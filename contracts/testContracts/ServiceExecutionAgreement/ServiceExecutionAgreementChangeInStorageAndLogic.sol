pragma solidity 0.4.25;

import 'zos-lib/contracts/Initializable.sol';
import '../../SEA/Common.sol';


/**
 * @title Service Execution Agreement
 * @author Ocean Protocol Team
 * @dev All function calls are currently implemented without side effects
 */
contract ServiceExecutionAgreementChangeInStorageAndLogic is Common, Initializable {

    struct Template {
        bool isExisting;
        bool isRevoked;
        address owner;
        bytes32[] conditionKeys;

        // 1st bit --> dependency, 2nd bit --> timeout flag (enabled/disabled)
        uint256[] dependenciesBits;
        uint8[] fulfillmentIndices;
        uint8 fulfillmentOperator;
    }

    mapping(bytes32 => Template) private templates;

    // instances of SEA Template
    struct Agreement {
        bool isExisting;
        bool isFulfilled;

        // maps the condition status in the template
        uint8[] conditionsState;
        // maps the condition status in the template
        uint8[] conditionLockedState;
        bytes32 templateId; // refers to SEA template id
        address consumer;
        address publisher;

        // condition Instance = hash(handler || value hash)
        bytes32[] conditionInstances;
        uint256[] timeoutValues; // in terms of block number not sec!
        bytes32 did; // Decentralized Identifier
    }

    // keep track of how many times a function was called.
    mapping (address=>uint256) public called;

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
                agreements[agreementIds[i]].isFulfilled == true,
                'Owner can not revoke template!');
        }
        _;
    }

    // check if no longer pending unfulfilled conditions in the SEA
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
    modifier isValidConditionHandler(
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
    )
    {
        require(
            templates[templateId].isExisting == true,
            'Template does not exist');
        require(
            templates[templateId].isRevoked == false,
            'Template is revoked');
        require(
            !agreements[agreementId].isExisting,
            'Service Agreement is already existing, Indicating Replay attack');
        _;
    }

    modifier isValidTemplateId(bytes32 templateId) {
        require(
            !templates[templateId].isExisting,
            'Template ID already exists');
        _;
    }

    modifier onlyExistConditionKey(
        bytes32 agreementId,
        bytes32 condition
    )
    {
        Template storage template = templates
        [agreements[agreementId].templateId];
        uint256 conditionIndex = conditionKeyToIndex[condition];
        require(
            template.conditionKeys[conditionIndex] == condition,
            'Invalid condition key');
        _;
    }

    // events
    event TemplateSetup(
        bytes32 indexed templateId,
        address indexed provider
    );

    event TemplateRevoked(
        bytes32 indexed templateId,
        bool isRevoked
    );

    event ConditionSetup(
        bytes32 indexed templateId,
        bytes32 indexed conditionKey,
        address indexed provider
    );

    event ConditionInitialized(
        bytes32 indexed agreementId,
        bytes32 indexed condition,
        bytes32 indexed did,
        bool status,
        address templateOwner,
        address consumer
    );

    event ConditionFulfilled(
        bytes32 indexed agreementId,
        bytes32 indexed templateId,
        bytes32 indexed condition
    );

    event AgreementInitialized(
        bytes32 indexed agreementId,
        bytes32 indexed templateId,
        bytes32 indexed did,
        bool status,
        address templateOwner,
        address consumer
    );

    event AgreementFulfilled(
        bytes32 indexed agreementId,
        bytes32 indexed templateId,
        address indexed owner
    );

    /**
	 * @notice setup Ocean's service execution agreement template only once!
	 * @dev requires some initial checks before deploying template on-chain
	 * @param templateId is a unique identifier for template generated by template owner using squid[py,js, or java]
	 * @param contracts array of condition contracts that have the fulfillment functions
	 * @param fingerprints array of 4 bytes of (fulfillment) function selectors
	 * @param dependenciesBits describes the dependency model which embeds or encode the relationship between
	 * template conditions and timeout flags
	 * @param fulfillmentIndices include which conditions are in charge to fulfill the
	 * agreement (mainly the reward functions)
	 * @param fulfillmentOperator describes the relation between conditions in the fulfillment indices (0 --> AND,
	 * 1--> OR, N--> M-of-N)
	 * @return true if the owner is able to setup the service execution agreement template
	 */
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
    returns (bool)
    {
        called[msg.sender] += 1;

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
            false,
            msg.sender,
            new bytes32[](0),
            dependenciesBits,
            fulfillmentIndices,
            fulfillmentOperator);

        for (uint256 i = 0; i < contracts.length; i++) {
            bytes32 conditionKey = generateConditionKey(
                templateId,
                contracts[i],
                fingerprints[i]);
            templates[templateId].conditionKeys.push(conditionKey);
            conditionKeyToIndex[conditionKey] = i;
            emit ConditionSetup(
                templateId,
                conditionKey,
                msg.sender
            );
        }
        emit TemplateSetup(templateId, msg.sender);
        return true;
    }

    /**
	 * @notice revokeTemplate revokes the template agreement, so the template will not be used in the future
	 * @param templateId is the service execution agreement template ID
	 * @return true if the service execution agreement template was revoked
	 */
    function revokeTemplate(bytes32 templateId)
    public
    isTemplateOwner(templateId)
    canRevokeTemplate(templateId)
    returns (bool)
    {
        templates[templateId].isRevoked = true;
        emit TemplateRevoked(templateId, true);
        return true;
    }

    /**
	 * @notice getTemplateOwner returns service execution agreement template owner
	 * @param templateId is the service execution agreement template ID
	 * @return template owner address
	 */
    function getTemplateOwner(bytes32 templateId) public view returns (address)
    {
        return templates[templateId].owner;
    }

    /**
	 * @notice getTemplateId returns template Id using agreement ID
	 * @param agreementId is the service execution agreement ID
	 * @return service execution template ID
	 */
    function getTemplateId(bytes32 agreementId) public view returns (bytes32)
    {
        return agreements[agreementId].templateId;
    }

    /// @notice getTemplateStatus is deprecated, use isTemplateRevoked instead (TODO)
    function getTemplateStatus(bytes32 templateId) public
    view returns (bool status){
        return !templates[templateId].isRevoked &&
        templates[templateId].isExisting;
    }

    /**
	 * @notice isTemplateExisting checks if the template exists or does not.
	 * @param templateId is the service execution agreement template ID
	 * @return true if the template exists
	 */
    function isTemplateExisting(bytes32 templateId) public view returns (bool)
    {
        return templates[templateId].isExisting;
    }

    /**
	 * @notice isTemplateExisting checks revocation status of the template
	 * @param templateId is the service execution agreement template ID
	 * @return true if the template is revoked
	 */
    function isTemplateRevoked(bytes32 templateId) public view returns (bool)
    {
        return templates[templateId].isRevoked;
    }

    /**
	 * @notice initializeAgreement enables users to consume SEA templates by creating new instances
	 * @dev validates the timeout length, reconstruct the agreement fingerprint and check the consumer signature,
	 * it also embeds `serviceAgreementId` in signature as nonce generated by consumer to block Replay-attack
	 * @param templateId is the service execution agreement template ID
	 * @param signature is the signature of the consumer indicating that he/she agreed on the values for the conditions
	 * @param consumer is the consumer's address
	 * @param valueHashes is the hash of all values associated with conditions in the DID document
	 * @param timeoutValues if exist (zero is the default value)
	 * @param agreementId is (unique identifier) service agreement instance ID
	 * @return true if the service agreement is successfully initialized
	 */
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
    returns (bool)
    {
        Template memory template = templates[templateId];

        require(
            timeoutValues.length == template.conditionKeys.length,
            'invalid timeout values length');

        // reconstruct the agreement fingerprint and check the consumer signature
        // embedding `agreementId` in signature as nonce generated by consumer to block Replay-attack
        bytes32 prefixedHash = prefixHash(
            hashAgreement(
                templateId,
                template.conditionKeys,
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

        emit AgreementInitialized(
            agreementId,
            templateId,
            did,
            false,
            template.owner,
            consumer
        );

        return true;
    }

    /**
    * @notice fulfillAgreement called in case of there are no pending fulfilments
    * @param agreementId is the service execution agreement ID
    * @return true if all the conditions are fulfilled according to the fulfillment criteria otherwise returns false
    */
    function fulfillAgreement(bytes32 agreementId)
    public
    noPendingFulfillments(agreementId)
    returns (bool)
    {
        Agreement storage agreement = agreements[agreementId];
        agreement.isExisting = true;
        agreement.isFulfilled = true;
        emit AgreementFulfilled(
            agreementId,
            agreement.templateId,
            templates[agreement.templateId].owner);
        return true;
    }

    /**
    * @notice hashAgreement generates unique fingerprint for agreement instance
    * @dev hashes all the parameters that is associated with the agreement
    * @param templateId is the SEA template ID
    * @param conditionKeys is an array of condition keys (hash(contract_address || function selector)
    * @param valueHashes is an array of hash of input values for the conditions, these values should be consistent with the
    *        passed values during the agreement initialization in order to get the same agreement hash
    * @param timeoutValues for each condition if exists, zero is the default value
    * @return agreement hash (unique identifier)
    */
    function hashAgreement(
        bytes32 templateId,
        bytes32[] conditionKeys,
        bytes32[] valueHashes,
        uint256[] timeoutValues,
        bytes32 agreementId
    )
    public pure
    returns (bytes32)
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

    /**
    * @dev getAgreementPublisher retrieves the service execution agreement publisher address
    * @param agreementId is the SEA agreement ID
    * @return publisher address
    */
    function getAgreementPublisher(bytes32 agreementId)
    public view
    returns (address)
    {
        return agreements[agreementId].publisher;
    }

    /**
    * @dev getAgreementConsumer retrieves the service execution agreement consumer address
    * @param agreementId is the SEA agreement ID
    * @return consumer address
    */
    function getAgreementConsumer(bytes32 agreementId)
    public view
    returns (address)
    {
        return agreements[agreementId].consumer;
    }

    /**
    * @dev isAgreementFulfilled retrieve the status of service execution agreement fulfilment
    * @param agreementId is the SEA agreement ID
    * @return true if the service execution agreement fulfilled
    */
    function isAgreementFulfilled(bytes32 agreementId)
    public view
    returns(bool)
    {
        return agreements[agreementId].isFulfilled;
    }

    /**
    * @dev isAgreementExisting checks if service execution agreement instance exists or not
    * @param agreementId is the SEA agreement ID
    * @return true if the service execution agreement exists
    */
    function isAgreementExisting(bytes32 agreementId)
    public view
    returns (bool)
    {
        return agreements[agreementId].isExisting;
    }

    /**
    * @notice fulfillCondition called by condition fulfillment handler - authorized contract and function
    * (conditionContract.functionSlector)
    * @dev it reconstructs the condition key using the template Id, address of the sender and the function fingerprint,
    * checks that there is no pending fulfilment for dependency conditions, then locks all the dependency conditions
    * to avoid replay attack
    * @param agreementId is the SEA agreement ID
    * @param fingerprint is 4 bytes of (fulfillment) function selector
    * @param valueHash is hash of input values for the condition which is part of the fulfilment
    * @return true if all the children conditions are fulfilled and the caller is authorized to access this function
    */
    function fulfillCondition(
        bytes32 agreementId,
        bytes4 fingerprint,
        bytes32 valueHash
    )
    public
    isValidConditionHandler(
        agreementId,
        fingerprint,
        valueHash
    )
    returns (bool)
    {

        Agreement storage agreement = agreements[agreementId];
        bytes32 conditionKey = generateConditionKey(
            agreement.templateId,
            msg.sender,
            fingerprint
        );
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

    /**
    * @notice condition state represents by  bits (1st bit for fulfilment 2nd bit (TODO: rename this function)
    * @dev getConditionStatus checks condition fulfilment status only if the condition key is exist
    * @param agreementId is the SEA agreement ID
    * @param conditionKey is located in DID which is a result of
    * hash(templateId || contractAddress || functionSelector (4bytes))
    * @return uint8 indicating the condition fulfilment status, the value holds all the information about
    * the dependency conditions and timeouts fulfillment
    */
    function getConditionStatus(
        bytes32 agreementId,
        bytes32 conditionKey
    )
    public
    onlyExistConditionKey(
        agreementId,
        conditionKey
    )
    view
    returns (uint8)
    {
        return agreements[agreementId]
        .conditionsState[conditionKeyToIndex[conditionKey]];
    }

    /**
    * @notice hashCondition used to generate condition instance from its key and input values hash in the DID
    * @dev hashes the condition key and input value hashes
    * @param conditionKey is hash(contractAddress || functionSelector)
    * @return condition Hash
    */
    function hashCondition(
        bytes32 conditionKey,
        bytes32 valueHash
    )
    public pure
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(conditionKey, valueHash));
    }

    /**
    * @notice generateConditionKey a utility function that is in charge to generate condition key
    * @dev hash ( template ID, conditionHandlerContractAddress , functionSelector/Fingerprint)
    * @param templateId is the SEA template ID
    * @param contractAddress is the contract address that is charge of fulfill set of conditions
    * @param fingerprint , condition handler function selector (4bytes) - only external and public functions
    * @return condition Key
    */
    function generateConditionKey(
        bytes32 templateId,
        address contractAddress,
        bytes4 fingerprint
    )
    public pure
    returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                templateId,
                contractAddress,
                fingerprint
            )
        );
    }

    /**
	 * @notice generateConditionKeyForId a utility function that is in charge to generate condition key form agreement ID
	 * @dev hash ( template ID, conditionHandlerContractAddress , functionSelector/Fingerprint)
	 * @param agreementId is the SEA agreement ID
	 * @param contractAddress is the condition handler contract address
	 * @param fingerprint is condition handler function selector (4bytes) - only external and public functions
	 * @return condition Key
	 */
    function generateConditionKeyForId(
        bytes32 agreementId,
        address contractAddress,
        bytes4 fingerprint
    )
    public view
    returns (bytes32)
    {
        return generateConditionKey(
            getTemplateId(agreementId),
            contractAddress,
            fingerprint);
    }

    /**
	 * @notice hasUnfulfilledDependencies a utility function that is in charge to check if the condition has unfulfilled
	 * dependency (conditions)
	 * @dev gets the condition dependencies in terms of dependency bits, checks them and the timeouts they are associated with
	 * @param agreementId is the SEA agreement ID
	 * @param conditionKey is hash (template ID, ContractAddress , functionSelector/Fingerprint)
	 * @return false if all the dependency conditions are fulfilled or there is no dependency conditions
	 */
    function hasUnfulfilledDependencies(
        bytes32 agreementId,
        bytes32 conditionKey
    )
    public view
    returns (bool)
    {
        Agreement storage agreement = agreements[agreementId];
        Template storage template = templates[agreement.templateId];
        uint dependenciesValue = template
        .dependenciesBits[conditionKeyToIndex[conditionKey]];

        // check the dependency conditions
        if (dependenciesValue == 0) {
            return false;
        }

        for (uint16 i = 0; i < template.conditionKeys.length; i++) {
            if (getBitValue(dependenciesValue, i, 0, 2) != 0) {
                uint8 timeoutFlag = getBitValue(dependenciesValue, i, 1, 2);
                if (timeoutFlag == 1) {
                    if (agreement.conditionsState[i] == 1 ||
                    !conditionTimedOut(agreementId, conditionKey)) {
                        return true;
                    }
                } else if (agreement.conditionsState[i] == 0) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
    * @notice conditionTimedOut is called by any actor in order to retrieve the status of the condition timeout
    * @dev check the current block.timestamp is greater than the condition timeout (TODO:block.timestamp could be manipulated by miners)
    * @param agreementId is the SEA agreement ID
    * @param conditionKey is hash(templateId, contractAddress, functionSelector/Fingerprint)
    * @return true if the condition is timed out
    */
    function conditionTimedOut(bytes32 agreementId, bytes32 conditionKey)
    public view
    returns (bool)
    {
        /* solium-disable-next-line security/no-block-members */
        if (block.timestamp > agreements[agreementId]
        .timeoutValues[conditionKeyToIndex[conditionKey]])
            return true;
        return false;
    }

    /**
    * @notice initializeConditions is called during agreement initialization
    * @dev condition is initialized by setting dependency conditions if exist, timeout values, and reconstructing the
    * condition key then derive the condition instance from this key, finally it emits event to notify the listeners
    * @param templateId is the SEA template Id
    * @param agreementId is the SEA agreement Id
    * @param valueHash is an array of the hashed input values that are associated with every condition
    * @param timeoutValues is an array of timeout values that are associated with the conditions (zero value is default)
    * @param did is a decentralized identifier that it is in charge of resolving the service
    * @return true if the condition is initialized without errors
    */
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

        for (uint256 i = 0;
            i < templates[templateId].conditionKeys.length;
            i++) {
            if (timeoutValues[i] != 0) {
                // TODO: define dynamic margin
                require(
                    timeoutValues[i] > 2,
                    'invalid timeout with a margin (~ 30 to 40 seconds = 2 blocks intervals) to avoid race conditions'
                );
                /* solium-disable-next-line security/no-block-members */
                agreement.timeoutValues.push(block.timestamp + timeoutValues[i]);
            } else {
                agreement.timeoutValues.push(0);
            }
            agreement.conditionsState.push(0);
            agreement.conditionLockedState.push(0);

            // add condition instance
            bytes32 conditionKey = hashCondition(
                templates[templateId].conditionKeys[i],
                valueHash[i]);
            agreement.conditionInstances.push(conditionKey);

            emit ConditionInitialized(
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

    /**
    * @notice lockChildConditions is used to avoid replay attack if the parent conditions are fulfilled
    * @dev checks the dependency bits and timeouts of the child condition before setting the state of the condition to locked
    * @param agreementId is the SEA agreement ID
    * @param condition is hash(templateId, contractAddress, functionSelector/Fingerprint)
    */
    function lockChildConditions(
        bytes32 agreementId,
        bytes32 condition,
        uint256 dependenciesValue
    )
    private
    {
        // check the dependency conditions
        Agreement storage agreement = agreements[agreementId];
        for (uint16 i = 0;
            i < templates[agreement.templateId].conditionKeys.length; i++) {
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

    /**
    * @dev get the current blockchain number in ocean network
    * @return block.number
    */
    function getCurrentBlockNumber()
    public view
    returns (uint blockNumber)
    {
        return block.number;
    }

    /**
    * @notice isValidSignature checks if the signature is valid
    * @param hash is SHA3 based hash of the original message
    * @param signature is an ECDSA based signature
    * @param consumer is the signer address
    * @return true if the recovered address equals the consumer's address
    */
    function isValidSignature(
        bytes32 hash,
        bytes signature,
        address consumer
    )
    public pure
    returns (bool)
    {
        return (consumer == recoverAddress(hash, signature));
    }

    // todo: this (getBitValue) needs refactoring, i am unable to understand that
    /**
    * @notice this is utility function which performs bitwise operations over dependency bits for more info please
    * check out this blog post: https://blog.oceanprotocol.com/ocean-integration-fitchain-secure-on-premises-compute-59f43a944266
    * @dev using dependency bit value, bit position(0-> dependency flag, 1-> timeout flag), and the condition index, this function
    * can check if this condition has a dependency condition/s or not by using bitwise operation (AND) between value and 2^(condIndex * 2) + bit position(0, 1))
    * @param value is the dependency bits value for a condition (compressed version of flags)
    * @param conditionIndex is the index of the condition in the conditions list
    * @param bitPosition is the first bit for dependency flag, second bit for timeout flag
    * @param numBits currently we have 2 bits but this to keep the function more generic for future updates
    * @return dependency bit Value = 1 if this index is an a dependency condition for the parent condition, or the timeout was set to 1, otherwise returns zero
    */
    function getBitValue(
        uint256 value,
        uint16 conditionIndex,
        uint16 bitPosition,
        uint16 numBits
    )
    private pure
    returns (uint8)
    {
        uint256 index = conditionIndex * numBits;
        uint8 tmp = uint8(value & (2 ** uint256((index) + bitPosition)));
        return tmp == 0 ? uint8(0) : uint8(1);
    }

}
