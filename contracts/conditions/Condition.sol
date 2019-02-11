pragma solidity 0.5.3;

import '../storage/ConditionStoreManager.sol';

contract Condition is Initializable {

    ConditionStoreManager internal conditionStoreManager;

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

    function fulfill(
        bytes32 _id,
        ConditionStoreLibrary.ConditionState _newState
    )
        internal
        returns (ConditionStoreLibrary.ConditionState)
    {
        // _newState can be Fulfilled or Aborted
        return conditionStoreManager.updateConditionState(_id, _newState);
    }


    function abortByTimeOut(
        bytes32 _id
    )
        internal
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            conditionStoreManager.isConditionTimedOut(_id),
            'Condition needs to be timed out'
        );
        return conditionStoreManager.updateConditionState(
            _id,
            ConditionStoreLibrary.ConditionState.Aborted
        );
    }
}
