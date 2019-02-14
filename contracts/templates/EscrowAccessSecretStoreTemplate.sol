pragma solidity 0.5.3;

import './TemplateStoreLibrary.sol';
import '../agreements/AgreementStoreManager.sol';
import '../agreements/AgreementStoreManager.sol';
import '../conditions/AccessSecretStoreCondition.sol';
import '../conditions/LockRewardCondition.sol';
import '../conditions/rewards/EscrowReward.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

contract EscrowAccessSecretStoreTemplate is Ownable {

    using TemplateStoreLibrary for TemplateStoreLibrary.TemplateList;

    TemplateStoreLibrary.TemplateList private templateList;
    address[] private conditionTypes;

    AgreementStoreManager private agreementStoreManager;
    AccessSecretStoreCondition private accessSecretStoreCondition;
    LockRewardCondition private lockRewardCondition;
    EscrowReward private escrowReward;

    function initialize(
        address _owner,
        address _agreementStoreManagerAddress,
        address _accessSecretStoreConditionAddress,
        address _lockRewardConditionAddress,
        address payable _escrowRewardAddress
    )
        public
        initializer()
    {
        require(
            _owner != address(0) &&
            _agreementStoreManagerAddress != address(0) &&
            _accessSecretStoreConditionAddress != address(0) &&
            _lockRewardConditionAddress != address(0) &&
            _escrowRewardAddress != address(0) ,
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
        address _didOwner,
        bytes32[] memory _conditionIds,
        uint[] memory _timeLocks,
        uint[] memory _timeOuts
    )
        public
        returns (uint size)
    {
        return agreementStoreManager.createAgreement(
            _id,
            _did,
            _didOwner,
            getConditionTypes(),
            _conditionIds,
            _timeLocks,
            _timeOuts
        );
    }

    function getConditionTypes()
        public
        view
        returns (address[] memory)
    {
        return conditionTypes;
    }
}
