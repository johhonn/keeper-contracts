pragma solidity 0.5.3;

import { EpochLibrary } from './EpochLibrary.sol';

library ConditionStoreLibrary {

    using EpochLibrary for EpochLibrary.Epoch;

    enum ConditionState { Uninitialized, Unfulfilled, Fulfilled, Aborted }

    struct Condition {
        address typeRef;
        ConditionState state;
        EpochLibrary.Epoch epoch;
    }

    struct ConditionList {
        mapping(bytes32 => Condition) conditions;
        bytes32[] conditionIds;
    }


    modifier onlyValidStateTransition(
        ConditionList storage _self,
        bytes32 _id,
        ConditionState _newState
    )
    {
        // once Fulfilled or Aborted no more transitions
        require(
            _self.conditions[_id].state < ConditionState.Fulfilled,
            'Invalid state transition'
        );
        // Uninitialized -> Unfulfilled -> {Fulfilled || Aborted}
        require(
            _self.conditions[_id].state < _newState,
            'Invalid state transition'
        );
        _;
    }

    function create(
        ConditionList storage _self,
        bytes32 _id,
        address _typeRef,
        uint256 _timeLock,
        uint256 _timeOut
    )
        internal
        returns (uint size)
    {
        _self.conditions[_id].typeRef = _typeRef;
        _self.conditions[_id].state = ConditionState.Unfulfilled;
        _self.conditions[_id].epoch.create(_timeLock, _timeOut);
        _self.conditionIds.push(_id);
        return _self.conditionIds.length;
    }

    function updateState(
        ConditionList storage _self,
        bytes32 _id,
        ConditionState _newState
    )
        internal
        onlyValidStateTransition(_self, _id, _newState)
        returns (ConditionState)
    {
        _self.conditions[_id].state = _newState;
        return _newState;
    }
}
