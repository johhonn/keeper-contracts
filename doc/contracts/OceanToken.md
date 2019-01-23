
# Contract: OceanToken

Documentation:
```
@title Ocean Protocol ERC20 Token Contract
@author Ocean Protocol Team
@dev All function calls are currently implemented without side effects
```

## Structs

## Variables

## Events

## Modifiers

## Functions

### public initialize

Documentation:

```
@dev OceanToken Initializer
Runs only on initial contract creation.
```
Parameters:
* address _minter

### public transfer

Documentation:

```
@dev Transfer token for a specified address when not paused
@param to The address to transfer to.
@param value The amount to be transferred.
```
Parameters:
* address to
* uint256 value

### public transferFrom

Documentation:

```
@dev Transfer tokens from one address to another when not paused
@param from address The address which you want to send tokens from
@param to address The address which you want to transfer to
@param value uint256 the amount of tokens to be transferred
```
Parameters:
* address from
* address to
* uint256 value
