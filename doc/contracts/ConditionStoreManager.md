
# contract: ConditionStoreManager


## Enums

###  RoleType
Members:
*  Create
*  Update

## Variables

### private createRole

### internal conditionList

### internal epochList

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
* enum ConditionStoreLibrary.ConditionState _state
* address _who

## Modifiers

### internal onlyCreateRole

### internal onlyUpdateRole
Parameters:
* bytes32 _id

### internal onlyValidType
Parameters:
* address typeRef

## Functions

### public initialize
Parameters:
* address _owner

### external getCreateRole

### external delegateCreateRole
Parameters:
* address delegatee

### external delegateUpdateRole
Parameters:
* bytes32 _id
* address delegatee

### external createCondition
Parameters:
* bytes32 _id
* address _typeRef

### public createCondition
Parameters:
* bytes32 _id
* address _typeRef
* uint256 _timeLock
* uint256 _timeOut

### external updateConditionState
Parameters:
* bytes32 _id
* enum ConditionStoreLibrary.ConditionState _newState

### external getConditionListSize

### external getCondition
Parameters:
* bytes32 _id

### external getConditionState
Parameters:
* bytes32 _id

### public isConditionTimeLocked
Parameters:
* bytes32 _id

### public isConditionTimedOut
Parameters:
* bytes32 _id
