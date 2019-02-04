pragma solidity 0.5.3;

import '../Common.sol';
import '../libraries/EpochLibrary.sol';
import '../libraries/ConditionStoreLibrary.sol';
import 'zos-lib/contracts/Initializable.sol';

contract ConditionStoreManager is Initializable, Common {

    using ConditionStoreLibrary for ConditionStoreLibrary.ConditionList;

    address private _createRole;
    ConditionStoreLibrary.ConditionList private conditionList;

    modifier onlyCreateRole(){
        require(
            _createRole == msg.sender,
            'Invalid CreateRole'
        );
        _;
    }

    modifier uniqueId(bytes32 _id) {
        require(
            !exists(_id),
            'Id already exists'
        );
        _;
    }

    modifier onlyValidAddress(address _address){
        require(
            _address != address(0),
            'Invalid address: 0x0'
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

    function setup(address createRole)
        public
        onlyValidAddress(createRole)
    {
        if(_createRole == address(0)){
            _createRole = createRole;
        }
    }

    function getCreateRole() public view returns (address) {
        return _createRole;
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
        onlyCreateRole
        uniqueId(_id)
        onlyValidAddress(_typeRef)
        returns (uint size)
    {
        return conditionList.create(
            _id,
            _typeRef,
            _timeLock,
            _timeOut
        );
    }

    function updateConditionState(
        bytes32 _id,
        ConditionStoreLibrary.ConditionState _newState
    )
        public
        onlyTypeRef(_id)
        returns (ConditionStoreLibrary.ConditionState)
    {
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
        timeLock = conditionList.conditions[_id].epoch.timeLock;
        timeOut = conditionList.conditions[_id].epoch.timeOut;
        blockNumber = conditionList.conditions[_id].epoch.blockNumber;
    }

    function getConditionListSize() public view returns (uint size) {
        return conditionList.conditionIds.length;
    }
}
