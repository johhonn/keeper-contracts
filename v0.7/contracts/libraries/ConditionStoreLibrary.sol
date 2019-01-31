pragma solidity 0.5.0;

import './EpochLibrary.sol';

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
        uint _timeLock,
        uint _timeOut
    )
        internal
        returns (uint size)
    {
        _self.conditions[_id] = Condition({
            typeRef: _typeRef,
            state: ConditionState.Unfulfilled,
            epoch: EpochLibrary.Epoch({
                timeLock: _timeLock,
                timeOut: _timeOut,
                blockNumber: EpochLibrary.getCurrentBlockNumber()
            })
        });
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


//    function isTimeout(bytes32 id) public view returns (bool) {
//        return ( (ConditionList._conditions[id].timeout > 0)
//                  && (block.number > ConditionList._conditions[id].timeout) );
//    }
}