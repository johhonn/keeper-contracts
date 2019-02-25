
# contract: ConditionStoreManager


## Variables

### private createRole

### internal conditionList

### internal epochList

## Modifiers

### internal onlyCreateRole

### internal onlyUpdateRole
Parameters:
* bytes32 _id

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

## Functions

### public initialize
Parameters:
* address _owner
* address _createRole

### public getCreateRole

### public createCondition
Parameters:
* bytes32 _id
* address _typeRef

### public createCondition
Parameters:
* bytes32 _id
* address _typeRef
* uint256 _timeLock
* uint256 _timeOut

### public updateConditionState
Parameters:
* bytes32 _id
* enum ConditionStoreLibrary.ConditionState _newState

### public getConditionListSize

### external getCondition
Parameters:
* bytes32 _id

### public getConditionState
Parameters:
* bytes32 _id

### public isConditionTimeLocked
Parameters:
* bytes32 _id

### public isConditionTimedOut
Parameters:
* bytes32 _id
