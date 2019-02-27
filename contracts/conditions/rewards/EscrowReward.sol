pragma solidity 0.5.3;

import './Reward.sol';
import '../ConditionStoreLibrary.sol';

contract EscrowReward is Reward {

    event Fulfilled(
        bytes32 indexed _agreementId,
        address indexed _receiver,
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
        address lockConditionTypeRef;
        ConditionStoreLibrary.ConditionState lockConditionState;
        (lockConditionTypeRef,lockConditionState,,,,,) = conditionStoreManager
            .getCondition(_lockCondition);

        bytes32 generatedLockConditionId = keccak256(
            abi.encodePacked(
                _agreementId,
                lockConditionTypeRef,
                keccak256(
                    abi.encodePacked(
                        address(this),
                        _amount
                    )
                )
            )
        );
        require(
            generatedLockConditionId == _lockCondition,
            'LockCondition ID does not match'
        );
        require(
            lockConditionState ==
            ConditionStoreLibrary.ConditionState.Fulfilled,
            'LockCondition needs to be Fulfilled'
        );
        require(
            token.balanceOf(address(this)) >= _amount,
            'Not enough balance'
        );

        ConditionStoreLibrary.ConditionState state = conditionStoreManager
            .getConditionState(_releaseCondition);

        address escrowReceiver = address(0x0);
        if (state == ConditionStoreLibrary.ConditionState.Fulfilled)
        {
            escrowReceiver = _receiver;
            state = _transferAndFulfill(id, _receiver, _amount);
        } else if (state == ConditionStoreLibrary.ConditionState.Aborted)
        {
            escrowReceiver = _sender;
            state = _transferAndFulfill(id, _sender, _amount);
        } else
        {
            return conditionStoreManager.getConditionState(id);
        }

        emit Fulfilled(
            _agreementId,
            escrowReceiver,
            id,
            _amount
        );

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



