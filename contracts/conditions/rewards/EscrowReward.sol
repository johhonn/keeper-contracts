pragma solidity 0.5.3;

import './Reward.sol';
import '../ConditionStoreLibrary.sol';

contract EscrowReward is Reward {

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
        uint256 _amount,
        address _receiver,
        address _sender,
        bytes32 _lockCondition,
        bytes32 _releaseCondition
    )
        public pure
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                _amount,
                _receiver,
                _sender,
                _lockCondition,
                _releaseCondition
            )
        );
    }

    function fulfill(
        bytes32 _agreementId,
        uint256 _amount,
        address _receiver,
        address _sender,
        bytes32 _lockCondition,
        bytes32 _releaseCondition
    )
        external
        returns (ConditionStoreLibrary.ConditionState)
    {
        bytes32 id = generateId(
            _agreementId,
            hashValues(
                _amount,
                _receiver,
                _sender,
                _lockCondition,
                _releaseCondition
            )
        );
        require(
            conditionStoreManager.getConditionState(_lockCondition) ==
            ConditionStoreLibrary.ConditionState.Fulfilled,
            'LockCondition needs to be Fulfilled'
        );
        require(
            token.balanceOf(address(this)) >= _amount,
            'Not enough balance'
        );

        ConditionStoreLibrary.ConditionState state =
            conditionStoreManager.getConditionState(_releaseCondition);

        if (state == ConditionStoreLibrary.ConditionState.Fulfilled)
        {
            state = _transferAndFulfill(id, _receiver, _amount);
        } else if (state == ConditionStoreLibrary.ConditionState.Aborted)
        {
            state = _transferAndFulfill(id, _sender, _amount);
        }

        return state;
    }

    function _transferAndFulfill(
        bytes32 _id,
        address _receiver,
        uint256 _amount
    )
        private
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            token.transfer(_receiver, _amount),
            'Could not transfer token'
        );
        return super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }
}



