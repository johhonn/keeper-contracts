
# Contract: PaymentConditions

Documentation:
```
@title Payment Conditions
@author Ocean Protocol Team
@dev All function calls are currently implemented without side effects
```

## Structs

### public Payment
Members:
* address sender
* address receiver
* uint256 amount

## Variables

### private agreementStorage

### private token

### private payments

## Events

###  PaymentLocked
Parameters:
* bytes32 agreementId
* address sender
* address receiver
* uint256 amount

###  PaymentReleased
Parameters:
* bytes32 agreementId
* address sender
* address receiver
* uint256 amount

###  PaymentRefund
Parameters:
* bytes32 agreementId
* address sender
* address receiver
* uint256 amount

## Functions

### public initialize
Parameters:
* address _agreementAddress
* address _tokenAddress

### external lockPayment

Documentation:

```
@notice lockPayment is called by asset consumer
@dev checks if this condition has unfulfilled dependencies otherwise it will fulfil the condition and lock the payment
@param agreementId is the SEA agreement ID
@param assetId refers to DID
@param price is the asset or service price in OCN tokens
@return true if asset consumer is able to lock payment into paymentCondition.sol contract
```
Parameters:
* bytes32 agreementId
* bytes32 assetId
* uint256 price

### external releasePayment

Documentation:

```
@notice releasePayment is called only by asset publisher
@dev it checks if this condition has unfulfilled dependencies otherwise it will fulfil the condition and release the payment
@param agreementId is the SEA agreement ID
@param assetId refers to DID
@param price is the asset or service price in OCN tokens
@return true if the publisher is able to release the payment
```
Parameters:
* bytes32 agreementId
* bytes32 assetId
* uint256 price

### external refundPayment

Documentation:

```
@notice refundPayment is called by asset consumer
@dev it checks if this condition has unfulfilled dependencies otherwise it will fulfil the condition and make refund
@param agreementId is the SEA agreement ID
@param assetId refers to DID
@param price is the asset or service price in OCN tokens
@return true if the consumer is able to make refund
```
Parameters:
* bytes32 agreementId
* bytes32 assetId
* uint256 price

### public hashValues

Documentation:

```
@notice hashValues called by anyone and it produces hash of input values
@dev it hashes the price and assetID (DID) in order to generate unique hash that it is used for condition authorization
@param assetId refers to DID
@param price is the asset or service price in OCN tokens
@return hash of the input values
```
Parameters:
* bytes32 assetId
* uint256 price
