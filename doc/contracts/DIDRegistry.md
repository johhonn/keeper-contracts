
# Contract: DIDRegistry

Documentation:
```
@title DID Registry
@author Ocean Protocol Team
@dev All function calls are currently implemented without side effects
```

## Variables

### internal didRegisterList

## Events

###  DIDAttributeRegistered
Parameters:
* bytes32 _did
* address _owner
* bytes32 _checksum
* string _value
* address _lastUpdatedBy
* uint256 _blockNumberUpdated

## Functions

### public initialize
Parameters:
* address _owner

### public registerAttribute

Documentation:

```
@notice registerAttribute is called only by DID owner.
@dev this function registers DID attributes
@param _did refers to decentralized identifier (a byte32 length ID)
@param _checksum includes a one-way HASH calculated using the DDO content
@param _value refers to the attribute value
```
Parameters:
* bytes32 _did
* bytes32 _checksum
* string _value

### public getBlockNumberUpdated

Documentation:

```
@notice getUpdateAt is called by anyone.
@param _did refers to decentralized identifier (a byte32 length ID)
@return last modified (update) time of a DID
```
Parameters:
* bytes32 _did

### public getDIDOwner

Documentation:

```
@notice getDidOwner is called by anyone.
@param _did refers to decentralized identifier (a byte32 length ID)
@return the address of the owner
```
Parameters:
* bytes32 _did

### public getDIDRegistrySize
