
# contract: EscrowAccessSecretStoreTemplate


## Structs

### public EscrowAccessSecretStoreAgreement
Members:
* address consumer

### public EscrowAccessSecretStoreAgreementList
Members:
* mapping(bytes32 => struct EscrowAccessSecretStoreTemplate.EscrowAccessSecretStoreAgreement) agreements
* bytes32[] agreementIds

## Variables

### private accessSecretStoreCondition

### private lockRewardCondition

### private escrowReward

### private agreementList

## Events

###  AgreementCreated
Parameters:
* bytes32   _agreementId
* bytes32   _did
* address   _accessConsumer
* address   _accessProvider
* uint[]    _timeLocks
* uint[]    _timeOuts

## Functions

### public initialize
Parameters:
* address _owner
* address _agreementStoreManagerAddress
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
* address _consumer
