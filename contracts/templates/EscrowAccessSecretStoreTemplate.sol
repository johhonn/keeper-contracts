pragma solidity 0.5.3;

import './AgreementTemplate.sol';
import '../conditions/AccessSecretStoreCondition.sol';
import '../conditions/LockRewardCondition.sol';
import '../conditions/rewards/EscrowReward.sol';
import '../registry/DIDRegistry.sol';

contract EscrowAccessSecretStoreTemplate is AgreementTemplate {

    DIDRegistry internal didRegistry;
    AccessSecretStoreCondition internal accessSecretStoreCondition;
    LockRewardCondition internal lockRewardCondition;
    EscrowReward internal escrowReward;

    AgreementData internal agreementData;

    event AgreementCreated(
        bytes32 indexed _agreementId,
        bytes32 indexed _did,
        address indexed _accessConsumer,
        address _accessProvider,
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
        // storing some additional information for the template
        agreementData.agreementDataItems[_id]
            .accessConsumer = _accessConsumer;
        agreementData.agreementDataItems[_id]
            .accessProvider = didRegistry.getDIDOwner(_did);
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
