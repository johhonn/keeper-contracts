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
        address _typeRef
    )
        internal
        returns (uint size)
    {
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
        onlyValidStateTransition(_self, _id, _newState)
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
