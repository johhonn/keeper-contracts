
# Contract: DIDRegistry

Documentation:
```
@title DID Registry
@author Ocean Protocol Team
@dev All function calls are currently implemented without side effects
```

## Structs

### public DIDRegister
Members:
* address owner
* uint256 updateAt

## Variables

### private didRegister

## Events

###  DIDAttributeRegistered
Parameters:
* bytes32 did
* address owner
* bytes32 key
* string value
* enum DIDRegistry.ValueType valueType
* uint256 updatedAt

## Modifiers

## Functions

### public initialize
Parameters:
* address _owner

### public registerAttribute

Documentation:

```
@notice registerAttribute is called only by DID owner.
@dev this function registers DID attributes
@param did refers to decentralized identifier (a byte32 length ID)
@param valueType includes DID, DID reference , URL, or DDO
@param key represents the attribute key
@param value refers to the attribute value
```
Parameters:
* bytes32 did
* enum DIDRegistry.ValueType valueType
* bytes32 key
* string value

### public getUpdateAt

Documentation:

```
@notice getUpdateAt is called by anyone.
@param did refers to decentralized identifier (a byte32 length ID)
@return last modified (update) time of a DID
```
Parameters:
* bytes32 did

### public getOwner

Documentation:

```
@notice getOwner is called by anyone.
@param did refers to decentralized identifier (a byte32 length ID)
@return the address of the owner
```
Parameters:
* bytes32 did
