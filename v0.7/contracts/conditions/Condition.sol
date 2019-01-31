pragma solidity 0.5.0;

import '../storage/ConditionStoreManager.sol';

contract Condition {
    ConditionStoreManager internal conditionStoreManager;

    event ConditionFulfilled(bytes32 indexed agreementId, address indexed _type, bytes32 id);

    modifier onlyUnfulfilled(bytes32 _id) {
        require(
            isConditionUnfulfilled(_id),
            'Condition needs to be Unfulfilled'
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
        return keccak256(abi.encodePacked(_agreementId, address(this), _valueHash));
    }

    function fulfill(
        bytes32 _id,
        ConditionStoreLibrary.ConditionState _newState
    )
        internal
        onlyUnfulfilled(_id)
        returns (ConditionStoreLibrary.ConditionState)
    {
        return conditionStoreManager.updateConditionState(_id, _newState);
    }

    function isConditionUninitialized(bytes32 _condition) public view returns (bool) {
        return ( conditionStoreManager.getConditionState(_condition) ==
            ConditionStoreLibrary.ConditionState.Uninitialized );
    }

    function isConditionUnfulfilled(bytes32 _condition) public view returns (bool) {
        return ( conditionStoreManager.getConditionState(_condition) ==
            ConditionStoreLibrary.ConditionState.Unfulfilled );
    }

    function isConditionFulfilled(bytes32 _condition) public view returns (bool) {
        return ( conditionStoreManager.getConditionState(_condition) ==
            ConditionStoreLibrary.ConditionState.Fulfilled );
    }

    function isConditionAborted(bytes32 _condition) public view returns (bool) {
        return ( conditionStoreManager.getConditionState(_condition) ==
            ConditionStoreLibrary.ConditionState.Aborted);
    }
}