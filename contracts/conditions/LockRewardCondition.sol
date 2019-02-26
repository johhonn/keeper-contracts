pragma solidity 0.5.3;

import './Condition.sol';
import '../OceanToken.sol';

contract LockRewardCondition is Condition {

    OceanToken private token;

    event Fulfilled(
        bytes32 indexed _agreementId,
        address indexed _rewardAddress,
        bytes32 _conditionId,
        uint256 _amount
    );

    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _tokenAddress
    )
        external
        initializer()
    {
        require(
            _tokenAddress != address(0) &&
            _conditionStoreManagerAddress != address(0),
            'Invalid address'
        );
        Ownable.initialize(_owner);
        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );
        token = OceanToken(_tokenAddress);
    }

    function hashValues(
        address _rewardAddress,
        uint256 _amount
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_rewardAddress, _amount));
    }

    function fulfill(
        bytes32 _agreementId,
        address _rewardAddress,
        uint256 _amount
    )
        external
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            token.transferFrom(msg.sender, _rewardAddress, _amount),
            'Could not transfer token'
        );

        bytes32 _id = generateId(
            _agreementId,
            hashValues(_rewardAddress, _amount)
        );
        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );

        emit Fulfilled(
            _agreementId,
            _rewardAddress,
            _id,
            _amount
        );

        return state;
    }
}
