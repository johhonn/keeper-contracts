pragma solidity 0.5.3;

import '../../Common.sol';
import '../../libraries/EpochLibrary.sol';
import '../../libraries/ConditionStoreLibrary.sol';
import 'zos-lib/contracts/Initializable.sol';

contract ConditionStoreWithBug is Initializable, Common {

    using ConditionStoreLibrary for ConditionStoreLibrary.ConditionList;
    using EpochLibrary for EpochLibrary.EpochList;

    address private createRole;
    ConditionStoreLibrary.ConditionList private conditionList;
    EpochLibrary.EpochList private epochList;

    modifier onlyCreateRole(){
        require(
            createRole == msg.sender,
            'Invalid CreateConditionRole'
        );
        _;
    }

    modifier onlyUpdateRole(bytes32 _id)
    {
        require(
            conditionList.conditions[_id].typeRef == address(msg.sender),
            'Invalid UpdateRole'
        );
        _;
    }

    function initialize(
        address _createRole
    )
        public
        initializer()
    {
        require(
            _createRole != address(0),
            'Invalid address'
        );
        require(
            createRole == address (0),
            'Role already assigned'
        );
        createRole = _createRole;
    }

    function getCreateRole()
        public
        view
        returns (address)
    {
        return createRole;
    }

    function createCondition(
        bytes32 _id,
        address _typeRef
    )
        public
        returns (uint size)
    {
        return createCondition(
            _id,
            _typeRef,
            uint(0),
            uint(0)
        );
    }

    // create: Uninitialized --> Unfulfilled
    function createCondition(
        bytes32 _id,
        address _typeRef,
        uint _timeLock,
        uint _timeOut
    )
        public
        onlyCreateRole
        returns (uint size)
    {
        require(
            _typeRef != address(0),
            'Invalid address'
        );
        epochList.create(_id, _timeLock, _timeOut);
        return conditionList.create(_id, _typeRef);
    }

    // update: Unfulfilled --> Fulfilled | Aborted | ...
    function updateConditionState(
        bytes32 _id,
        ConditionStoreLibrary.ConditionState _newState
    )
        public
        onlyUpdateRole(_id)
        returns (ConditionStoreLibrary.ConditionState)
    {
        // no update before time lock
        require(
            !isConditionTimeLocked(_id),
            'TimeLock is not over yet'
        );

        ConditionStoreLibrary.ConditionState updateState = _newState;
        // auto abort after time out
        if (isConditionTimedOut(_id))
            updateState = ConditionStoreLibrary.ConditionState.Aborted;
        return conditionList.updateState(_id, updateState);
    }

    function getConditionListSize() public view returns (uint size) {
        return conditionList.conditionIds.length;
    }

    function getCondition(bytes32 _id)
        external
        view
        returns (
            address typeRef,
            ConditionStoreLibrary.ConditionState state,
            uint timeLock,
            uint timeOut,
            uint blockNumber,
            address lastUpdatedBy,
            uint blockNumberUpdated
        )
    {
        typeRef = conditionList.conditions[_id].typeRef;
        state = conditionList.conditions[_id].state;
        timeLock = epochList.epochs[_id].timeLock;
        timeOut = epochList.epochs[_id].timeOut;
        blockNumber = epochList.epochs[_id].blockNumber;
        lastUpdatedBy = conditionList.conditions[_id].lastUpdatedBy;
        blockNumberUpdated = conditionList.conditions[_id].blockNumberUpdated;
    }

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

    function isConditionTimeLocked(bytes32 _id)
        public
        view
        returns (bool)
    {
        return epochList.isTimeLocked(_id);
    }

    function isConditionTimedOut(bytes32 _id)
        public
        view
        returns (bool)
    {
        return epochList.isTimedOut(_id);
    }
}
