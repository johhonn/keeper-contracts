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

    modifier onlyParent(){
        require(
            _createConditionRole == msg.sender,
            'Invalid CreateConditionRole'
        );
        _;
    }

    modifier onlyCondition(bytes32 _id)
    {
        require(
            conditionList.conditions[_id].typeRef == address(msg.sender),
            'Invalid UpdateRole'
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

    // create: Uninitialized --> Unfulfilled
    function createCondition(
        bytes32 _id,
        address _typeRef,
        uint _timeLock,
        uint _timeOut
    )
        public
        onlyParent
        isValidAddress(_typeRef)
        returns (uint size)
    {
        epochList.create(_id, _timeLock, _timeOut);
        return conditionList.create(_id, _typeRef);
    }

    // update: Unfulfilled --> Fulfilled | Aborted | ...
    function updateConditionState(
        bytes32 _id,
        ConditionStoreLibrary.ConditionState _newState
    )
        public
        onlyCondition(_id)
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            (conditionList.conditions[_id].state == ConditionStoreLibrary.ConditionState.Unfulfilled) &&
            (_newState > conditionList.conditions[_id].state),
            'Invalid state transition'
        );
        // no update before time lock
        require(
            !isConditionTimeLocked(_id),
            'TimeLock is not over yet'
        );
        // auto abort after time out
        if (isConditionTimedOut(_id))
            _newState = ConditionStoreLibrary.ConditionState.Aborted;
        return conditionList.updateState(_id, _newState);
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
