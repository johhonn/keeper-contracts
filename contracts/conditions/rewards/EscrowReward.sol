pragma solidity 0.5.3;

import './Reward.sol';
import '../ConditionStoreLibrary.sol';

contract EscrowReward is Reward {

    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _tokenAddress
    )
        public
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

        if (
            conditionStoreManager.getConditionState(_releaseCondition) ==
            ConditionStoreLibrary.ConditionState.Fulfilled)
        {
            return _transferAndFulfill(id, _receiver, _amount);
        } else if (
            conditionStoreManager.getConditionState(_releaseCondition) ==
            ConditionStoreLibrary.ConditionState.Aborted)
        {
            return _transferAndFulfill(id, _sender, _amount);
        }
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



