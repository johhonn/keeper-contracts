
# contract: EscrowAccessSecretStoreTemplate


## Structs

### public AgreementDataModel
Members:
* address accessConsumer
* address accessProvider

### public AgreementData
Members:
* mapping(bytes32 => struct EscrowAccessSecretStoreTemplate.AgreementDataModel) agreementDataItems
* bytes32[] agreementIds

## Variables

### internal didRegistry

### internal accessSecretStoreCondition

### internal lockRewardCondition

### internal escrowReward

### internal agreementData

## Events

###  AgreementCreated
Parameters:
* bytes32 _agreementId
* bytes32 _did
* address _accessConsumer
* address _accessProvider
* uint256[] _timeLocks
* uint256[] _timeOuts

## Functions

### external initialize
Parameters:
* address _owner
* address _agreementStoreManagerAddress
* address _didRegistryAddress
* address _accessSecretStoreConditionAddress
* address _lockRewardConditionAddress
* address _escrowRewardAddress

### public createAgreement
Parameters:
* bytes32 _id
* bytes32 _did
* bytes32[] _conditionIds
* uint256[] _timeLocks
* uint256[] _timeOuts
* address _accessConsumer

### external getAgreementData
Parameters:
* bytes32 _id
