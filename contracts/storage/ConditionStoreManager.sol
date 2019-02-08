pragma solidity 0.5.3;

import '../Common.sol';
import '../libraries/EpochLibrary.sol';
import '../libraries/ConditionStoreLibrary.sol';
import 'zos-lib/contracts/Initializable.sol';

contract ConditionStoreManager is Initializable, Common {

    using ConditionStoreLibrary for ConditionStoreLibrary.ConditionList;
    using EpochLibrary for EpochLibrary.EpochList;

    address private _createConditionRole;
    ConditionStoreLibrary.ConditionList private conditionList;
    EpochLibrary.EpochList private epochList;

    modifier onlyCreateConditionRole(){
        require(
            _createConditionRole == msg.sender,
            'Invalid CreateConditionRole'
        );
        _;
    }

    modifier onlyTypeRef(bytes32 _id)
    {
        require(
            conditionList.conditions[_id].typeRef == address(msg.sender),
            'Invalid UpdateRole'
        );
        _;
    }

    modifier isUniqueId(bytes32 _id) {
        require(
            !exists(_id),
            'Id already exists'
        );
        _;
    }

    modifier isValidAddress(address _address){
        require(
            _address != address(0),
            'Invalid address: 0x0'
        );
        _;
    }

    modifier isUnfulfilled(bytes32 _id) {
        require(
            isConditionUnfulfilled(_id),
            'Condition needs to be Unfulfilled'
        );
        _;
    }

    modifier isValidFulfillState(
        ConditionStoreLibrary.ConditionState _state
    )
    {
        require(
            _state > ConditionStoreLibrary.ConditionState.Unfulfilled,
            'Invalid state transition'
        );
        _;
    }


    function setup(address createConditionRole)
        public
        isValidAddress(createConditionRole)
    {
        if(_createConditionRole == address(0)){
            _createConditionRole = createConditionRole;
        }
    }

    function getCreateConditionRole()
        public
        view
        returns (address)
    {
        return _createConditionRole;
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

    function createCondition(
        bytes32 _id,
        address _typeRef,
        uint _timeLock,
        uint _timeOut
    )
        public
        onlyCreateConditionRole
        isUniqueId(_id)
        isValidAddress(_typeRef)
        returns (uint size)
    {
        if (_timeLock > 0 || _timeOut > 0) {
            epochList.create(
                _id,
                _timeLock,
                _timeOut
            );
        }
        return conditionList.create(
            _id,
            _typeRef
        );
    }

    function updateConditionState(
        bytes32 _id,
        ConditionStoreLibrary.ConditionState _newState
    )
        public
        isValidFulfillState(_newState)
        isUnfulfilled(_id)
        onlyTypeRef(_id)
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            !isConditionTimeLocked(_id),
            'TimeLock is not over yet'
        );
        // auto abort on time out
        if (isConditionTimedOut(_id))
            return conditionList.updateState(
                _id,
                ConditionStoreLibrary.ConditionState.Aborted
            );
        return conditionList.updateState(_id, _newState);
    }

    function exists(bytes32 _id)
        public
        view
        returns (bool)
    {
        return (
            conditionList.conditions[_id].state !=
            ConditionStoreLibrary.ConditionState.Uninitialized
        );
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
            uint blockNumber
        )
    {
        typeRef = conditionList.conditions[_id].typeRef;
        state = conditionList.conditions[_id].state;
        timeLock = epochList.epochs[_id].timeLock;
        timeOut = epochList.epochs[_id].timeOut;
        blockNumber = epochList.epochs[_id].blockNumber;
    }

    function getConditionState(bytes32 _id)
        public
        view
        returns (ConditionStoreLibrary.ConditionState)
    {
        return conditionList.conditions[_id].state;
    }

    function isConditionUninitialized(bytes32 _id)
        public
        view
        returns (bool)
    {
        return (
            getConditionState(_id) ==
            ConditionStoreLibrary.ConditionState.Uninitialized
        );
    }

    function isConditionUnfulfilled(bytes32 _id)
        public
        view
        returns (bool)
    {
        return (
            getConditionState(_id) ==
            ConditionStoreLibrary.ConditionState.Unfulfilled
        );
    }

    function isConditionFulfilled(bytes32 _id)
        public
        view
        returns (bool)
    {
        return (
            getConditionState(_id) ==
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }

    function isConditionAborted(bytes32 _id)
        public
        view
        returns (bool)
    {
        return (
            getConditionState(_id) ==
            ConditionStoreLibrary.ConditionState.Aborted
        );
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
