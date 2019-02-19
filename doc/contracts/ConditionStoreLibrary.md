
# Contract: ConditionStoreLibrary


## Structs

### public Condition
Members:
* address typeRef
* enum ConditionStoreLibrary.ConditionState state
* address lastUpdatedBy
* uint256 blockNumberUpdated

### public ConditionList
Members:
* mapping(bytes32 => struct ConditionStoreLibrary.Condition) conditions
* bytes32[] conditionIds

## Events

###  ConditionCreated
Parameters:
* bytes32 _id
* address _typeRef
* address _who

###  ConditionUpdated
Parameters:
* bytes32 _id
* address _typeRef
* address _who
* enum ConditionStoreLibrary.ConditionState _state

## Functions

### internal create
Parameters:
* struct ConditionStoreLibrary.ConditionList _self
* bytes32 _id
* address _typeRef

### internal updateState
Parameters:
* struct ConditionStoreLibrary.ConditionList _self
* bytes32 _id
* enum ConditionStoreLibrary.ConditionState _newState
