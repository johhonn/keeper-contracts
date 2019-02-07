pragma solidity 0.5.3;

import './Reward.sol';
import '../../libraries/ConditionStoreLibrary.sol';


contract EscrowReward is Reward {

    constructor(
        address _conditionStoreManagerAddress,
        address _tokenAddress
    )
        public
    {
        conditionStoreManager = ConditionStoreManager(_conditionStoreManagerAddress);
        token = OceanToken(_tokenAddress);
    }

    function() external payable {}

    function hashValues(
        uint256 _amount,
        address _receiver,
        address _sender,
        bytes32 _lockCondition,
        bytes32 _releaseCondition
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(
                _amount,
                _receiver,
                _sender,
                _lockCondition,
                _releaseCondition));
    }

    function fulfill(
        bytes32 _agreementId,
        uint256 _amount,
        address _receiver,
        address _sender,
        bytes32 _lockCondition,
        bytes32 _releaseCondition
    )
        public
        returns (ConditionStoreLibrary.ConditionState)
    {
        bytes32 id = generateId(
            _agreementId,
            hashValues(_amount, _receiver, _sender, _lockCondition, _releaseCondition)
        );
        require(
            isConditionFulfilled(_lockCondition),
            'LockCondition needs to be Fulfilled'
        );
        require(
            token.balanceOf(address(this)) >= _amount,
            'Not enough balance'
        );

        if (isConditionFulfilled(_releaseCondition)) {
            return _transferAndFulfill(id, _receiver, _amount);
        } else if (isConditionAborted(_releaseCondition)) {
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
        return super.fulfill(_id, ConditionStoreLibrary.ConditionState.Fulfilled);
    }
}



