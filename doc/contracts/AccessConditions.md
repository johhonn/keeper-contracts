
# Contract: AccessConditions

Documentation:
```
@title Secret Store Access Control
@author Ocean Protocol Team
@dev All function calls are currently implemented without side effects
```

## Variables

### private assetPermissions

### private agreementStorage

## Events

###  AccessGranted
Parameters:
* bytes32 agreementId
* bytes32 asset

## Modifiers

### internal onlySLAPublisher
Parameters:
* bytes32 agreementId
* address publisher

## Functions

### public initialize
Parameters:
* address _agreementAddress

### public checkPermissions

Documentation:

```
@notice checkPermissions is called by Parity secret store
@param consumer is the asset consumer address
@param documentKeyId refers to the DID in which secret store will issue the decryption keys
@return true if the access was granted
```
Parameters:
* address consumer
* bytes32 documentKeyId

### external grantAccess

Documentation:

```
@notice grantAccess is called by asset/resource/DID owner/SLA Publisher
@param agreementId is the SEA agreement ID
@param documentKeyId refers to the DID in which secret store will issue the decryption keys
@return true if the SLA publisher is able to grant access
```
Parameters:
* bytes32 agreementId
* bytes32 documentKeyId
