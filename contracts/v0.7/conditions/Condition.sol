pragma solidity 0.5.3;

import '../storage/ConditionStoreManager.sol';
import 'zos-lib/contracts/Initializable.sol';

contract Condition is Initializable {

    ConditionStoreManager internal conditionStoreManager;

    event ConditionFulfilled(
        bytes32 indexed _agreementId,
        address indexed _type,
        bytes32 _id
    );

    modifier onlyUnfulfilled(bytes32 _id) {
        require(
            isConditionUnfulfilled(_id),
            'Condition needs to be Unfulfilled'
        );
        _;
    }

    modifier onlyValidFulfillState(
        ConditionStoreLibrary.ConditionState _state
    )
    {
        require(
            _state > ConditionStoreLibrary.ConditionState.Unfulfilled,
            'New state needs to be higher than Unfulfilled'
        );
        _;
    }

    function generateId(
        bytes32 _agreementId,
        bytes32 _valueHash
    )
        public
        view
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                _agreementId,
                address(this),
                _valueHash
            )
        );
    }

    function __fulfill(
        bytes32 _id,
        ConditionStoreLibrary.ConditionState _newState
    )
        internal
        onlyUnfulfilled(_id)
        onlyValidFulfillState(_newState)
        returns (ConditionStoreLibrary.ConditionState)
    {
        // _newState can be Fulfilled or Aborted
        return conditionStoreManager.updateConditionState(_id, _newState);
    }

    function isConditionUninitialized(bytes32 _condition)
        public view
        returns (bool)
    {
        return ( conditionStoreManager.getConditionState(_condition) ==
            ConditionStoreLibrary.ConditionState.Uninitialized );
    }

    function isConditionUnfulfilled(bytes32 _condition)
        public view
        returns (bool)
    {
        return ( conditionStoreManager.getConditionState(_condition) ==
            ConditionStoreLibrary.ConditionState.Unfulfilled );
    }

    function isConditionFulfilled(bytes32 _condition)
        public view
        returns (bool)
    {
        return ( conditionStoreManager.getConditionState(_condition) ==
            ConditionStoreLibrary.ConditionState.Fulfilled );
    }

    function isConditionAborted(bytes32 _condition)
        public view
        returns (bool)
    {
        return ( conditionStoreManager.getConditionState(_condition) ==
            ConditionStoreLibrary.ConditionState.Aborted);
    }
}
