pragma solidity 0.5.6;


library ConditionStoreLibrary {

    enum ConditionState { Uninitialized, Unfulfilled, Fulfilled, Aborted }

    struct Condition {
        ConditionState state;
        uint256 blockNumberUpdated;
        address typeRef;
        address lastUpdatedBy;
    }

    struct ConditionList {
        mapping(bytes32 => Condition) conditions;
        bytes32[] conditionIds;
    }

    function create(
        ConditionList storage _self,
        bytes32 _id,
        address _typeRef
    )
        internal
        returns (uint size)
    {
        require(
            _self.conditions[_id].blockNumberUpdated == 0,
            'Id already exists'
        );

        _self.conditions[_id] = Condition({
            state: ConditionState.Unfulfilled,
            blockNumberUpdated: block.number,
            typeRef: _typeRef,
            lastUpdatedBy: msg.sender
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
        returns (ConditionState)
    {
        require(
            _self.conditions[_id].state == ConditionState.Unfulfilled &&
            _newState > _self.conditions[_id].state,
            'Invalid state transition'
        );

        _self.conditions[_id].state = _newState;
        _self.conditions[_id].lastUpdatedBy = msg.sender;
        _self.conditions[_id].blockNumberUpdated = block.number;

        return _newState;
    }
}
