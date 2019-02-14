pragma solidity 0.5.3;

import '../conditions/AccessSecretStoreCondition.sol';
import '../conditions/LockRewardCondition.sol';
import '../conditions/rewards/EscrowReward.sol';
import './Template.sol';


contract EscrowAccessSecretStoreTemplate is Template {

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
}
