
# contract: EscrowAccessSecretStoreTemplate

Documentation:
```
@title Agreement Template
@author Ocean Protocol Team
 * @dev Implementation of Agreement Template
 *      Escrow Access secret store template is use case specific template.
     Anyone (consumer/provider/publisher) can use this template in order
     to setup an on-chain SEA. The template is a composite of three basic
     conditions. Once the agreement is created, the consumer will lock an amount
     of tokens (as listed in the DID document - off-chain metadata) to the 
     the lock reward contract which in turn will fire an event. ON the other hand 
     the provider is listening to the to all the emitted events, the provider 
     will catch the event and grant permissions to the consumer through 
     secret store contract, the consumer now is able to download the data set
     by asking the off-chain component of secret store to decrypt the DID and 
     encrypt it using the consumer's public key. Then the secret store will 
     provide an on-chain proof that the consumer had access to the data set.
     Finally, the provider can call the escrow reward condition in order 
     to release the payment. Every condition has a time window (time lock and 
     time out). This implies that if the provider didn't grant the access to 
     the consumer through secret store within this time window, the consumer 
     can ask for refund.
```

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

Documentation:

```
@notice initialize init the 
      contract with the following parameters.
@dev this function is called only once during the contract
      initialization. It initializes the ownable feature, and 
      set push the required condition types including 
      access secret store, lock reward and escrow reward conditions.
@param _owner contract's owner account address
@param _agreementStoreManagerAddress agreement store manager contract address
@param _didRegistryAddress DID registry contract address
@param _accessSecretStoreConditionAddress access secret store contract address
@param _lockRewardConditionAddress lock reward condition contract address
@param _escrowRewardAddress escrow reward contract address
```
Parameters:
* address _owner
* address _agreementStoreManagerAddress
* address _didRegistryAddress
* address _accessSecretStoreConditionAddress
* address _lockRewardConditionAddress
* address _escrowRewardAddress

### public createAgreement

Documentation:

```
@notice createAgreement creates agreements through agreement template
@dev this function initializes the agreement by setting the DID,
      conditions ID, timeouts, time locks and the consumer address.
      The DID provider/owner is automatically detected by the DID
      Registry
@param _id SEA agreement unique identifier
@param _did Decentralized Identifier (DID)
@param _conditionIds conditions ID associated with the condition types
@param _timeLocks the starting point of the time window ,time lock is 
      in block number not seconds
@param _timeOuts the ending point of the time window ,time lock is 
      in block number not seconds
@param _accessConsumer consumer address
@return the agreement index
```
Parameters:
* bytes32 _id
* bytes32 _did
* bytes32[] _conditionIds
* uint256[] _timeLocks
* uint256[] _timeOuts
* address _accessConsumer

### external getAgreementData

Documentation:

```
@notice getAgreementData return the agreement Data
@param _id SEA agreement unique identifier
@return the agreement consumer and provider addresses
```
Parameters:
* bytes32 _id
