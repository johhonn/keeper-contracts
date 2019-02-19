
# contract: Condition


## Variables

### internal conditionStoreManager

## Functions

### public generateId
Parameters:
* bytes32 _agreementId
* bytes32 _valueHash

### internal fulfill
Parameters:
* bytes32 _id
* enum ConditionStoreLibrary.ConditionState _newState

### external abortByTimeOut
Parameters:
* bytes32 _id
