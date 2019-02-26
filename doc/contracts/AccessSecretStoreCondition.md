
# contract: AccessSecretStoreCondition


## Variables

### private documentPermissions

### private agreementStoreManager

## Events

### Fulfilled
Parameters:
* bytes32 _agreementId
* bytes32 _documentId
* address _grantee
* bytes32 _conditionId

## Functions

### public initialize
Parameters:
* address _owner
* address _conditionStoreManagerAddress
* address _agreementStoreManagerAddress

### public hashValues
Parameters:
* bytes32 _documentId
* address _grantee

### public fulfill
Parameters:
* bytes32 _agreementId
* bytes32 _documentId
* address _grantee

### public checkPermissions

Documentation:

```
@notice checkPermissions is called by Parity secret store
@param _documentId refers to the DID in which secret store will issue the decryption keys
@param _grantee is the address of the granted user
@return true if the access was granted
```
Parameters:
* address _grantee
* bytes32 _documentId
