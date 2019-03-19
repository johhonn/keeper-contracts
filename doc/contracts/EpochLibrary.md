
# library: EpochLibrary


## Structs

### public Epoch
Members:
* uint256 timeLock
* uint256 timeOut
* uint256 blockNumber

### public EpochList
Members:
* mapping(bytes32 => struct EpochLibrary.Epoch) epochs
* bytes32[] epochIds

## Functions

### internal create

Documentation:

```
@notice create creates new Epoch
@param _self is the Epoch storage pointer
@param _timeLock value in block count (can not fulfill before)
@param _timeOut value in block count (can not fulfill after)
```
Parameters:
* struct EpochLibrary.EpochList _self
* bytes32 _id
* uint256 _timeLock
* uint256 _timeOut

### external isTimedOut

Documentation:

```
@notice isTimedOut means you cannot fulfill after
@param _self is the Epoch storage pointer
@return true if the current block number is gt timeOut
```
Parameters:
* struct EpochLibrary.EpochList _self
* bytes32 _id

### external isTimeLocked

Documentation:

```
@notice isTimeLocked means you cannot fulfill before
@param _self is the Epoch storage pointer
@return true if the current block number is gt timeLock
```
Parameters:
* struct EpochLibrary.EpochList _self
* bytes32 _id

### public getEpochTimeOut

Documentation:

```
@notice getEpochTimeOut
@param _self is the Epoch storage pointer
```
Parameters:
* struct EpochLibrary.Epoch _self

### public getEpochTimeLock

Documentation:

```
@notice getEpochTimeLock
@param _self is the Epoch storage pointer
```
Parameters:
* struct EpochLibrary.Epoch _self
