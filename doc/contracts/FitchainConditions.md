
# Contract: FitchainConditions

Documentation:
```
TODO: Implementing commit-reveal approach to avoid the front-running
TODO: Implement slashing conditions
TODO: use enum VoteType rather than 1 and 2
```

## Structs

### public Verifier
Members:
* bool exists
* bool vote
* bool nonce
* uint256 timeout

### public Model
Members:
* bool exists
* bool isTrained
* bool isVerified
* uint256 verifierThreshold
* uint256[] voteCount
* bytes32 result
* address consumer
* address provider
* mapping(address => struct FitchainConditions.Verifier) GPCVerifiers
* mapping(address => struct FitchainConditions.Verifier) VPCVerifiers

### public Actor
Members:
* bool isStaking
* uint256 amount
* uint256 slots
* uint256 maxSlots

## Variables

### internal registry

### private models

### private verifiers

### private stake

### private maxSlots

### private agreementStorage

## Events

###  VerifierRegistered
Parameters:
* address verifier
* uint256 slots

###  VerifierDeregistered
Parameters:
* address verifier

###  VerifierElected
Parameters:
* address verifier
* bytes32 agreementId

###  PoTInitialized
Parameters:
* bool state

###  VPCInitialized
Parameters:
* bool state

###  VerificationConditionState
Parameters:
* bytes32 agreementId
* bool state

###  TrainingConditionState
Parameters:
* bytes32 agreementId
* bool state

###  SlotsFreed
Parameters:
* address verifier
* uint256 slots

###  VotesSubmitted
Parameters:
* bytes32 agreementId
* address Publisher
* uint256 voteType

## Modifiers

### internal onlyPublisher
Parameters:
* bytes32 modelId

### internal onlyGPCVerifier
Parameters:
* bytes32 modelId

### internal onlyVPCVerifier
Parameters:
* bytes32 modelId

### internal onlyVerifiers
Parameters:
* bytes32 modelId

### internal onlyValidSlotsValue
Parameters:
* uint256 slots

### internal onlyFreeSlots

### internal onlyValidVotes
Parameters:
* bytes32 modelId
* uint256 voteType
* uint256 count

## Functions

### public initialize
Parameters:
* address agreementAddress
* uint256 _stake
* uint256 _maxSlots

### external registerVerifier

Documentation:

```
@notice registerVerifier called by any verifier in order to be registered as a verifier
@dev any verifier is able to register with a certain number of slots, (TODO:implementing staking)
@param slots refers to the number of pools that a verifier can offer to join multiple verification games at a time
@return true if an actor is able to register himself/herself as a verifier
```
Parameters:
* uint256 slots

### external deregisterVerifier

Documentation:

```
@notice deregisterVerifier called by any verifier in order to deregister him/herself
@dev checks that verifier has no longer part of any verification games, then free slot
@return true if all the verifier's slots are free
```

### external initPoT

Documentation:

```
@notice initPoT called by publisher or model provider which elects verifiers
@dev performs some input checks, elect verifiers and notify them to start the verification game
@param modelId represents the SEA agreement Id in Ocean and Model Id in Fitchain
@param k is the number of voters that are required to witness the proof of training (PoT) in Fitchain network
@param timeout is the timeout period to set the vote (This will be changed for more advanced options)
@return true if all the challenge initiated successfully
```
Parameters:
* bytes32 modelId
* uint256 k
* uint256 timeout

### external initVPCProof

Documentation:

```
@notice initVPCProof called by publisher or model provider electing verifiers to check the verification proof in Fitchain
@dev performs some security checks, elect verifiers and notify them to start the game
@param modelId represents the service level agreement Id in Ocean and Model Id in Fitchain
@param k is the number of voters that are required to witness the proof of verification in Fitchain network
@param timeout is the timeout period to set the vote
@return true if all the challenge initiated successfully
```
Parameters:
* bytes32 modelId
* uint256 k
* uint256 timeout

### external voteForPoT

Documentation:

```
@notice voteForPoT called by verifiers where they vote for the existence of verification proof
@dev performs some security checks, set the vote and update the state of voteCount
and emit some events to notify the model provider/publisher that all votes have been submitted
@param modelId represents the SEA agreement Id in Ocean and Model Id in Fitchain
@param vote is the result of isTrained in Fitchain (T/F)
```
Parameters:
* bytes32 modelId
* bool vote

### external voteForVPC

Documentation:

```
@notice voteForVPC called by verifiers where they vote for the existence of verification proof
@dev performs some security checks, set the vote and update the state of voteCount
and emit some events to notify the model provider/publisher that all votes have been submitted
@param modelId refers to the SEA agreement Id in Ocean and Model Id in Fitchain
@param vote is the result of isVerified in Fitchain (T/F)
@return true if the caller (verifier) is able to commit his vote regarding the VPC proof
```
Parameters:
* bytes32 modelId
* bool vote

### external setPoT

Documentation:

```
@notice setPoT (Gossiper pool contract in Fitchain) is called only by the service provider.
@dev At first It checks if the proof state is created or not, then uses the count to
reconstruct the right condition key based on the signed agreement
@param modelId refers the SEA agreement Id in Ocean and Model Id in Fitchain
@param count represents the number of submitted votes by verifiers who are illegible to check the PoT in Fitchain
@return true if the publisher is able to set the proof of training to true
```
Parameters:
* bytes32 modelId
* uint256 count

### external setVPC

Documentation:

```
@notice setVPC (verification pool contract in Fitchain) is called only by the model provider.
@dev At first It checks if the proof state is created or not, then uses the count to
reconstruct the right condition key based on the signed agreement
@param modelId represents the service level agreement Id in Ocean and Model Id in Fitchain
@param count represents the number of submitted votes by verifiers who who are illegible to check the verification proof in Fitchain
@return true if the publisher is able to set the VPC proof to true
```
Parameters:
* bytes32 modelId
* uint256 count

### external freeMySlots

Documentation:

```
@notice freeMySlots is called by verifier in order to be able to deregister
@dev it checks if the verifier is involved in a witnessing game or not
reconstruct the right condition key based on the signed agreement
@param modelId represents the SEA Id in Ocean and Model Id in Fitchain
@return true if a verifier is able to free its slots
```
Parameters:
* bytes32 modelId

### public getAvailableVerifiersCount

Documentation:

```
@notice getAvailableVerifiersCount gets the number of available verifiers
@dev returns the number of available verifiers using registry length
@return number of available verifiers
```

### public getMaximumNumberOfSlots

Documentation:

```
@notice getMaximumNumberOfSlots, view function returns max number of slots
@dev verifiers will not be able to register if they are supplying slots > maxSlots
@return number of maximum slots
```

### public getMyFreeSlots

Documentation:

```
@notice getMyFreeSlots returns the verifier free slots
@return number of free slots for a verifier
```

### private electRRKVerifiers

Documentation:

```
@notice electRRKVerifiers private function, elects K verifiers using round-robin
@dev remove verifiers from registry if there is no available slots to serve more verification games
@param modelId represents the service level agreement Id in Ocean and Model Id in Fitchain
@param k is the number of required verifiers
@param vType represents the type of the verifier (1 -> GPC, 2 -> VPC)
@param timeout optional but is required to set the voting timeout
```
Parameters:
* bytes32 modelId
* uint256 k
* uint256 vType
* uint256 timeout

### private addVerifierToRegistry

Documentation:

```
@notice addVerifierToRegistry private function maintains the verifiers registry
@dev add verifiers to the registry, and updates the slots number
@param verifier is the verifier address
```
Parameters:
* address verifier

### private removeVerifierFromRegistry

Documentation:

```
@notice removeVerifierFromRegistry private function maintains the verifiers registry
@dev removes a verifier from registry
@param verifier is the verifier address
@return true if verifier is removed from the registry
```
Parameters:
* address verifier
