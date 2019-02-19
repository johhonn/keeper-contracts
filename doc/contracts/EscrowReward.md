
# Contract: EscrowReward


## Functions

### public initialize
Parameters:
* address _owner
* address _conditionStoreManagerAddress
* address _tokenAddress

### public hashValues
Parameters:
* uint256 _amount
* address _receiver
* address _sender
* bytes32 _lockCondition
* bytes32 _releaseCondition

### public fulfill
Parameters:
* bytes32 _agreementId
* uint256 _amount
* address _receiver
* address _sender
* bytes32 _lockCondition
* bytes32 _releaseCondition

### private _transferAndFulfill
Parameters:
* bytes32 _id
* address _receiver
* uint256 _amount
