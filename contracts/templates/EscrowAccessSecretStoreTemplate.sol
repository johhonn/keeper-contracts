pragma solidity 0.5.6;

import './AgreementTemplate.sol';
import '../conditions/AccessSecretStoreCondition.sol';
import '../conditions/LockRewardCondition.sol';
import '../conditions/rewards/EscrowReward.sol';
import '../registry/DIDRegistry.sol';

/**
 * @title Agreement Template
 * @author Ocean Protocol Team
 *
 * @dev Implementation of Agreement Template
 *
 *      Escrow Access secret store template is use case specific template.
 *      Anyone (consumer/provider/publisher) can use this template in order
 *      to setup an on-chain SEA. The template is a composite of three basic
 *      conditions. Once the agreement is created, the consumer will lock an amount
 *      of tokens (as listed in the DID document - off-chain metadata) to the 
 *      the lock reward contract which in turn will fire an event. ON the other hand 
 *      the provider is listening to the to all the emitted events, the provider 
 *      will catch the event and grant permissions to the consumer through 
 *      secret store contract, the consumer now is able to download the data set
 *      by asking the off-chain component of secret store to decrypt the DID and 
 *      encrypt it using the consumer's public key. Then the secret store will 
 *      provide an on-chain proof that the consumer had access to the data set.
 *      Finally, the provider can call the escrow reward condition in order 
 *      to release the payment. Every condition has a time window (time lock and 
 *      time out). This implies that if the provider didn't grant the access to 
 *      the consumer through secret store within this time window, the consumer 
 *      can ask for refund.
 */
contract EscrowAccessSecretStoreTemplate is AgreementTemplate {

    DIDRegistry internal didRegistry;
    AccessSecretStoreCondition internal accessSecretStoreCondition;
    LockRewardCondition internal lockRewardCondition;
    EscrowReward internal escrowReward;

    AgreementData internal agreementData;

    event AgreementCreated(
        bytes32 indexed _agreementId,
        bytes32 _did,
        address indexed _accessConsumer,
        address indexed _accessProvider,
        uint[]  _timeLocks,
        uint[]  _timeOuts
    );

    struct AgreementDataModel {
        address accessConsumer;
        address accessProvider;
    }

    struct AgreementData {
        mapping(bytes32 => AgreementDataModel) agreementDataItems;
        bytes32[] agreementIds;
    }

   /**
    * @notice initialize init the 
    *       contract with the following parameters.
    * @dev this function is called only once during the contract
    *       initialization. It initializes the ownable feature, and 
    *       set push the required condition types including 
    *       access secret store, lock reward and escrow reward conditions.
    * @param _owner contract's owner account address
    * @param _agreementStoreManagerAddress agreement store manager contract address
    * @param _didRegistryAddress DID registry contract address
    * @param _accessSecretStoreConditionAddress access secret store contract address
    * @param _lockRewardConditionAddress lock reward condition contract address
    * @param _escrowRewardAddress escrow reward contract address
    */
    function initialize(
        address _owner,
        address _agreementStoreManagerAddress,
        address _didRegistryAddress,
        address _accessSecretStoreConditionAddress,
        address _lockRewardConditionAddress,
        address _escrowRewardAddress
    )
        external
        initializer()
    {
        require(
            _owner != address(0) &&
            _agreementStoreManagerAddress != address(0) &&
            _didRegistryAddress != address(0) &&
            _accessSecretStoreConditionAddress != address(0) &&
            _lockRewardConditionAddress != address(0) &&
            _escrowRewardAddress != address(0),
            'Invalid address'
        );

        Ownable.initialize(_owner);

        agreementStoreManager = AgreementStoreManager(
            _agreementStoreManagerAddress
        );

        didRegistry = DIDRegistry(
            _didRegistryAddress
        );

        accessSecretStoreCondition = AccessSecretStoreCondition(
            _accessSecretStoreConditionAddress
        );

        lockRewardCondition = LockRewardCondition(
            _lockRewardConditionAddress
        );

        escrowReward = EscrowReward(
            _escrowRewardAddress
        );

        conditionTypes.push(address(accessSecretStoreCondition));
        conditionTypes.push(address(lockRewardCondition));
        conditionTypes.push(address(escrowReward));
    }

   /**
    * @notice createAgreement creates agreements through agreement template
    * @dev this function initializes the agreement by setting the DID,
    *       conditions ID, timeouts, time locks and the consumer address.
    *       The DID provider/owner is automatically detected by the DID
    *       Registry
    * @param _id SEA agreement unique identifier
    * @param _did Decentralized Identifier (DID)
    * @param _conditionIds conditions ID associated with the condition types
    * @param _timeLocks the starting point of the time window ,time lock is 
    *       in block number not seconds
    * @param _timeOuts the ending point of the time window ,time lock is 
    *       in block number not seconds
    * @param _accessConsumer consumer address
    * @return the agreement index
    */
    function createAgreement(
        bytes32 _id,
        bytes32 _did,
        bytes32[] memory _conditionIds,
        uint[] memory _timeLocks,
        uint[] memory _timeOuts,
        address _accessConsumer
    )
        public
        returns (uint size)
    {
        super.createAgreement(
            _id,
            _did,
            _conditionIds,
            _timeLocks,
            _timeOuts
        );

        address owner = address(0);
        address[] memory providers;
        (owner, , , , providers) = didRegistry.getDIDRegister(_did);

        // storing some additional information for the template
        agreementData.agreementDataItems[_id]
            .accessConsumer = _accessConsumer;

        if (providers.length > 0) {
            agreementData.agreementDataItems[_id]
                .accessProvider = providers[0];
        } else {
            agreementData.agreementDataItems[_id]
                .accessProvider = owner;
        }

        agreementData.agreementIds.push(_id);

        emit AgreementCreated(
            _id,
            _did,
            agreementData.agreementDataItems[_id].accessConsumer,
            agreementData.agreementDataItems[_id].accessProvider,
            _timeLocks,
            _timeOuts
        );

        return agreementData.agreementIds.length;
    }

    /**
    * @notice getAgreementData return the agreement Data
    * @param _id SEA agreement unique identifier
    * @return the agreement consumer and provider addresses
    */
    function getAgreementData(bytes32 _id)
        external
        view
        returns (
            address accessConsumer,
            address accessProvider
        )
    {
        accessConsumer = agreementData.agreementDataItems[_id].accessConsumer;
        accessProvider = agreementData.agreementDataItems[_id].accessProvider;
    }
}
