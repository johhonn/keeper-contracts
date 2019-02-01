pragma solidity 0.5.0;

import '../storage/ConditionStoreManager.sol';

contract Condition {
    ConditionStoreManager internal conditionStoreManager;

    event ConditionFulfilled(bytes32 indexed agreementId, address indexed _type, bytes32 id);

    function generateId(bytes32 agreementId, bytes32 valueHash) public view returns (bytes32){
        return keccak256(abi.encodePacked(agreementId, address(this), valueHash));
    }

    function fulfill(
        bytes32 _id,
        ConditionStoreLibrary.ConditionState _newState
    )
        internal
        returns (ConditionStoreLibrary.ConditionState)
    {
        return conditionStoreManager.updateConditionState(_id, _newState);
    }
}