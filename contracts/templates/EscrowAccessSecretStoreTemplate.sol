pragma solidity 0.5.3;

import '../conditions/AccessSecretStoreCondition.sol';
import '../conditions/LockRewardCondition.sol';
import '../conditions/rewards/EscrowReward.sol';
import './AgreementTemplate.sol';


contract EscrowAccessSecretStoreTemplate is AgreementTemplate {

    AccessSecretStoreCondition private accessSecretStoreCondition;
    LockRewardCondition private lockRewardCondition;
    EscrowReward private escrowReward;

    EscrowAccessSecretStoreAgreementList private agreementList;

    struct EscrowAccessSecretStoreAgreement {
        address consumer;
    }

    struct EscrowAccessSecretStoreAgreementList {
        mapping(bytes32 => EscrowAccessSecretStoreAgreement) agreements;
        bytes32[] agreementIds;
    }

    function initialize(
        address _owner,
        address _agreementStoreManagerAddress,
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
            _accessSecretStoreConditionAddress != address(0) &&
            _lockRewardConditionAddress != address(0) &&
            _escrowRewardAddress != address(0),
            'Invalid address'
        );
        Ownable.initialize(_owner);

        agreementStoreManager = AgreementStoreManager(
            _agreementStoreManagerAddress
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
        address _consumer
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
        agreementList.agreements[_id] = EscrowAccessSecretStoreAgreement({
            consumer: _consumer
        });
        agreementList.agreementIds.push(_id);
        return agreementList.agreementIds.length;
    }
}
