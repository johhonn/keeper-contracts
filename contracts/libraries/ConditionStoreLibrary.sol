pragma solidity 0.5.3;


library ConditionStoreLibrary {

    enum ConditionState { Uninitialized, Unfulfilled, Fulfilled, Aborted }

    event ConditionCreated(
        bytes32 indexed _id,
        address indexed _typeRef,
        address indexed _who
    );

    event ConditionUpdated(
        bytes32 indexed _id,
        address indexed _typeRef,
        address indexed _who,
        ConditionStoreLibrary.ConditionState _state
    );

    struct Condition {
        address typeRef;
        ConditionState state;
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
            _self.conditions[_id].state == ConditionState.Uninitialized,
            "Condition already created"
        );
        _self.conditions[_id] = Condition({
            typeRef: _typeRef,
            state: ConditionState.Unfulfilled
        });
        _self.conditionIds.push(_id);

        emit ConditionCreated(
            _id,
            _typeRef,
            msg.sender
        );

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
        _self.conditions[_id].state = _newState;

        emit ConditionUpdated(
            _id,
            _self.conditions[_id].typeRef,
            msg.sender,
            _newState
        );

        return _newState;
    }
}
