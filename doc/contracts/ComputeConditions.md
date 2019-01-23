
# Contract: ComputeConditions

Documentation:
```
@title On-premise compute conditions
@author Ocean Protocol Team
@notice This contract is WIP, don't use it for production
```

## Structs

### public ProofOfUpload
Members:
* bool exists
* bool isValid
* bool isLocked
* address dataConsumer
* bytes32 algorithmHash
* bytes algorithmHashSignature

## Variables

### private agreementStorage

### internal proofs

## Events

###  HashSignatureSubmitted
Parameters:
* bytes32 agreementId
* address consumer
* address publisher
* bool state

###  HashSubmitted
Parameters:
* bytes32 agreementId
* address consumer
* address publisher
* bool state

###  ProofOfUploadValid
Parameters:
* bytes32 agreementId
* address consumer
* address publisher

###  ProofOfUploadInvalid
Parameters:
* bytes32 agreementId
* address consumer
* address publisher

## Modifiers

### internal onlyDataConsumer
Parameters:
* bytes32 agreementId

### internal onlyComputePublisher
Parameters:
* bytes32 agreementId

### internal onlyStakeholders
Parameters:
* bytes32 agreementId

## Functions

### public initialize
Parameters:
* address agreementAddress

### external submitHashSignature

Documentation:

```
@notice submitHashSignature is called only by the data-consumer address.
@dev At first It checks if the proof state is created or not then checks that the hash
has been submitted by the publisher. This preserves the message integrity
it also proof that both parties agree on the same algorithm file(s)
@param agreementId is the service level agreement Id
@param signature data scientist signature = signed_hash(uploaded_algorithm_file/s)
```
Parameters:
* bytes32 agreementId
* bytes signature

### external submitAlgorithmHash

Documentation:

```
@notice submitAlgorithmHash is called only by the compute publisher.
@dev At first It checks if the proof state is created or not then checks if the signature
has been submitted by the data scientist in order to call fulfillUpload. This preserves
the message integrity and proof that both parties agree on the same algorithm file/s
@param agreementId the service level agreement Id
@param hash = kekccak(uploaded_algorithm_file/s)
@return true if the compute publisher is able to send the right algorithm hash
```
Parameters:
* bytes32 agreementId
* bytes32 hash

### public fulfillUpload

Documentation:

```
@notice fulfillUpload is called by anyone of the stakeholders [compute publisher or compute consumer]
@dev check if there are unfulfilled dependency condition, if false, it verifies the signature
using the submitted hash (by publisher), the signature (by data scientist/consumer) then call
fulfillCondition in service level agreement storage contract
@param agreementId the service level agreement Id
@param state get be used fo input value hash for this condition indicating the state of verification
```
Parameters:
* bytes32 agreementId
* bool state
