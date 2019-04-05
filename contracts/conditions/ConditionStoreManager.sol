pragma solidity 0.5.6;

import '../Common.sol';
import '../libraries/EpochLibrary.sol';
import './ConditionStoreLibrary.sol';

import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

contract ConditionStoreManager is Ownable, Common {

    using ConditionStoreLibrary for ConditionStoreLibrary.ConditionList;
    using EpochLibrary for EpochLibrary.EpochList;

    enum RoleType { Create, Update }
    address private createRole;
    ConditionStoreLibrary.ConditionList internal conditionList;
    EpochLibrary.EpochList internal epochList;

    event ConditionCreated(
        bytes32 indexed _id,
        address indexed _typeRef,
        address indexed _who
    );

    event ConditionUpdated(
        bytes32 indexed _id,
        address indexed _typeRef,
        ConditionStoreLibrary.ConditionState indexed _state,
        address _who
    );

    modifier onlyCreateRole(){
        require(
            createRole == msg.sender,
            'Invalid CreateRole'
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

    modifier onlyValidType(address typeRef)
    {
        require(
            typeRef != address(0),
            'Invalid address'
        );
        require(
            isContract(typeRef),
            'Invalid contract address'
        );
        _;
    }

    function initialize(
        address _owner
    )
        public
        initializer
    {
        require(
            _owner != address(0),
            'Invalid address'
        );
        require(
            createRole == address(0),
            'Role already assigned'
        );
        Ownable.initialize(_owner);
        createRole = _owner;
    }

    function getCreateRole()
        external
        view
        returns (address)
    {
        return createRole;
    }

    function delegateCreateRole(
        address delegatee
    )
        external
        onlyOwner()
    {
        require(
            delegatee != address(0),
            'Invalid delegatee address'
        );
        createRole = delegatee;
    }

    function delegateUpdateRole(
        bytes32 _id,
        address delegatee
    )
        external
        onlyOwner()
    {
        require(
            delegatee != address(0),
            'Invalid delegatee address'
        );
        require(
            conditionList.conditions[_id].typeRef != address(0),
            'Invalid condition Id'
        );
        conditionList.conditions[_id].typeRef = delegatee;
    }

    function createCondition(
        bytes32 _id,
        address _typeRef
    )
        external
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
        onlyValidType(_typeRef)
        returns (uint size)
    {
        epochList.create(_id, _timeLock, _timeOut);
        uint listSize = conditionList.create(_id, _typeRef);

        emit ConditionCreated(
            _id,
            _typeRef,
            msg.sender
        );

        return listSize;
    }

    // update: Unfulfilled --> Fulfilled | Aborted | ...
    function updateConditionState(
        bytes32 _id,
        ConditionStoreLibrary.ConditionState _newState
    )
        external
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

        ConditionStoreLibrary.ConditionState state = conditionList
            .updateState(_id, updateState);

        emit ConditionUpdated(
            _id,
            conditionList.conditions[_id].typeRef,
            _newState,
            msg.sender
        );

        return state;
    }

    function getConditionListSize()
        external
        view
        returns (uint size)
    {
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
        external
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
