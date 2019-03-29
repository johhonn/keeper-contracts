
# library: DIDRegistryLibrary

Documentation:
```
@title DID Registry Library
@author Ocean Protocol Team
 * @dev All function calls are currently implemented without side effects
```

## Structs

### public DIDRegister
Members:
* address owner
* bytes32 lastChecksum
* address lastUpdatedBy
* uint256 blockNumberUpdated
* address[] providers

### public DIDRegisterList
Members:
* mapping(bytes32 => struct DIDRegistryLibrary.DIDRegister) didRegisters
* bytes32[] didRegisterIds

## Functions

### external update

Documentation:

```
@notice update the DID store
@dev access modifiers and storage pointer should be implemented in DIDRegistry
@param _self refers to storage pointer
@param _did refers to decentralized identifier (a byte32 length ID)
@param _checksum includes a one-way HASH calculated using the DDO content
```
Parameters:
* struct DIDRegistryLibrary.DIDRegisterList _self
* bytes32 _did
* bytes32 _checksum

### internal addProvider
Parameters:
* struct DIDRegistryLibrary.DIDRegisterList _self
* bytes32 _did
* address provider

### internal removeProvider
Parameters:
* struct DIDRegistryLibrary.DIDRegisterList _self
* bytes32 _did
* address _provider

### public isProvider
Parameters:
* struct DIDRegistryLibrary.DIDRegisterList _self
* bytes32 _did
* address _provider

### private getProviderIndex
Parameters:
* struct DIDRegistryLibrary.DIDRegisterList _self
* bytes32 _did
* address provider
