
# contract: DIDRegistry

Documentation:
```
@title DID Registry
@author Ocean Protocol Team
 * @dev Implementation of the DID Registry.
     https://github.com/oceanprotocol/OEPs/tree/master/7#registry
```

## Variables

### internal didRegisterList

## Events

###  DIDAttributeRegistered

Documentation:

```
@dev This implementation does not store _value on-chain,
     but emits DIDAttributeRegistered events to store it in the event log.
```
Parameters:
* bytes32 _did
* address _owner
* bytes32 _checksum
* string _value
* address _lastUpdatedBy
* uint256 _blockNumberUpdated

## Functions

### public initialize

Documentation:

```
@dev DIDRegistry Initializer
     Initialize Ownable. Only on contract creation.
@param _owner refers to the owner of the contract.
```
Parameters:
* address _owner

### public registerAttribute

Documentation:

```
@notice Register DID attributes.
     * @dev The first attribute of a DID registered sets the DID owner.
     Subsequent updates record _checksum and update info.
     * @param _did refers to decentralized identifier (a bytes32 length ID).
@param _checksum includes a one-way HASH calculated using the DDO content.
@param _value refers to the attribute value, limited to 2048 bytes.
@return the size of the registry after the register action.
```
Parameters:
* bytes32 _did
* bytes32 _checksum
* string _value

### public getBlockNumberUpdated

Documentation:

```
@param _did refers to decentralized identifier (a bytes32 length ID).
@return last modified (update) block number of a DID.
```
Parameters:
* bytes32 _did

### public getDIDOwner

Documentation:

```
@param _did refers to decentralized identifier (a bytes32 length ID).
@return the address of the DID owner.
```
Parameters:
* bytes32 _did

### public getDIDRegistrySize

Documentation:

```
@return the length of the DID registry.
```
