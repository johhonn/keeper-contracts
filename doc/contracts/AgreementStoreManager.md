
# Contract: AgreementStoreManager


## Variables

### internal conditionStoreManager

### internal templateStoreManager

### internal agreementList

### internal didRegistry

## Events

###  AgreementCreated
Parameters:
* bytes32 _agreementId
* bytes32 _did
* address _sender
* address _templateId

## Functions

### public initialize
Parameters:
* address _owner
* address _conditionStoreManagerAddress
* address _templateStoreManagerAddress
* address _didRegistryAddress

### public createAgreement
Parameters:
* bytes32 _id
* bytes32 _did
* address[] _conditionTypes
* bytes32[] _conditionIds
* uint256[] _timeLocks
* uint256[] _timeOuts

### external getAgreement
Parameters:
* bytes32 _id

### external getAgreementDIDOwner
Parameters:
* bytes32 _id

### public getAgreementListSize
