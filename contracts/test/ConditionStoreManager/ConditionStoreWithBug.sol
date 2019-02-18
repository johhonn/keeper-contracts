pragma solidity 0.5.3;

import '../../conditions/ConditionStoreManager.sol';

contract ConditionStoreWithBug is ConditionStoreManager {
    function getConditionState(bytes32 _id)
        public
        view
        returns (ConditionStoreLibrary.ConditionState)
    {
        // adding Bug here: shouldn't return fulfilled
        if(uint(conditionList.conditions[_id].state) >= 0 )
            return ConditionStoreLibrary.ConditionState.Fulfilled;
        return ConditionStoreLibrary.ConditionState.Fulfilled;
    }
}
