# Analysis result for Roles

No issues found.
# Analysis results for PaymentConditions.sol

## External call
- SWC ID: 107
- Type: Informational
- Contract: PaymentConditions
- Function name: `fallback`
- PC address: 369
- Estimated Gas Usage: 1434 - 2235

### Description

The contract executes a function call to an external address. Verify that the code at this address is trusted and immutable.
In file: PaymentConditions.sol:81

### Code

```
agreementStorage.getAgreementConsumer(agreementId)
```

## External call
- SWC ID: 107
- Type: Informational
- Contract: PaymentConditions
- Function name: `releasePayment(bytes32,bytes32,uint256)`
- PC address: 2110
- Estimated Gas Usage: 1447 - 2248

### Description

The contract executes a function call to an external address. Verify that the code at this address is trusted and immutable.
In file: PaymentConditions.sol:136

### Code

```
agreementStorage.getAgreementPublisher(agreementId)
```

# Analysis result for Dispenser

No issues found.
# Analysis results for ComputeConditions.sol

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ComputeConditions
- Function name: `fallback`
- PC address: 141
- Estimated Gas Usage: 136 - 231

### Description

This binary add operation can result in integer overflow.
In file: ComputeConditions.sol:94

### Code

```
function submitHashSignature(
        bytes32 agreementId,
        bytes signature
    )
        external
        onlyDataConsumer(agreementId)
        returns(bool status)
        {
        if (proofs[agreementId].exists) {
            if (proofs[agreementId].isLocked) { // avoid race conditions
                emit HashSignatureSubmitted(
                    agreementId,
                    agreementStorage.getAgreementConsumer(agreementId),
                    agreementStorage.getAgreementPublisher(agreementId),
                    false
                );
                return false;
            }
            proofs[agreementId].isLocked = true;
            proofs[agreementId].algorithmHashSignature = signature;
            fulfillUpload(agreementId, true);
        }else{
            proofs[agreementId] = ProofOfUpload(
                true,
                false,
                true,
                agreementStorage.getAgreementConsumer(agreementId),
                bytes32(0),
                signature
            );
        }
        emit HashSignatureSubmitted(
            agreementId,
            agreementStorage.getAgreementConsumer(agreementId),
            agreementStorage.getAgreementPublisher(agreementId),
            true
        );
        proofs[agreementId].isLocked = false;
        return true;

    }
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ComputeConditions
- Function name: `fallback`
- PC address: 143
- Estimated Gas Usage: 142 - 237

### Description

This binary add operation can result in integer overflow.
In file: ComputeConditions.sol:94

### Code

```
function submitHashSignature(
        bytes32 agreementId,
        bytes signature
    )
        external
        onlyDataConsumer(agreementId)
        returns(bool status)
        {
        if (proofs[agreementId].exists) {
            if (proofs[agreementId].isLocked) { // avoid race conditions
                emit HashSignatureSubmitted(
                    agreementId,
                    agreementStorage.getAgreementConsumer(agreementId),
                    agreementStorage.getAgreementPublisher(agreementId),
                    false
                );
                return false;
            }
            proofs[agreementId].isLocked = true;
            proofs[agreementId].algorithmHashSignature = signature;
            fulfillUpload(agreementId, true);
        }else{
            proofs[agreementId] = ProofOfUpload(
                true,
                false,
                true,
                agreementStorage.getAgreementConsumer(agreementId),
                bytes32(0),
                signature
            );
        }
        emit HashSignatureSubmitted(
            agreementId,
            agreementStorage.getAgreementConsumer(agreementId),
            agreementStorage.getAgreementPublisher(agreementId),
            true
        );
        proofs[agreementId].isLocked = false;
        return true;

    }
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ComputeConditions
- Function name: `recoverAddress(bytes32,bytes)`
- PC address: 253
- Estimated Gas Usage: 202 - 390

### Description

This binary add operation can result in integer overflow.
In file: ComputeConditions.sol:37

### Code

```
e
    );
    event ProofOfUploadValid(
        bytes32 agreementId, 
        address consumer, 
        address publisher
    );
    event ProofOfUploadInvalid(
        bytes32 agreementId, 
       
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ComputeConditions
- Function name: `recoverAddress(bytes32,bytes)`
- PC address: 258
- Estimated Gas Usage: 214 - 402

### Description

This binary add operation can result in integer overflow.
In file: ComputeConditions.sol:37

### Code

```
e
    );
    event ProofOfUploadValid(
        bytes32 agreementId, 
        address consumer, 
        address publisher
    );
    event ProofOfUploadInvalid(
        bytes32 agreementId, 
       
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ComputeConditions
- Function name: `recoverAddress(bytes32,bytes)`
- PC address: 265
- Estimated Gas Usage: 239 - 427

### Description

This binary add operation can result in integer overflow.
In file: ComputeConditions.sol:37

### Code

```
e
    );
    event ProofOfUploadValid(
        bytes32 agreementId, 
        address consumer, 
        address publisher
    );
    event ProofOfUploadInvalid(
        bytes32 agreementId, 
       
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ComputeConditions
- Function name: `recoverAddress(bytes32,bytes)`
- PC address: 267
- Estimated Gas Usage: 245 - 433

### Description

This binary add operation can result in integer overflow.
In file: ComputeConditions.sol:37

### Code

```
e
    );
    event ProofOfUploadValid(
        bytes32 agreementId, 
        address consumer, 
        address publisher
    );
    event ProofOfUploadInvalid(
        bytes32 agreementId, 
       
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ComputeConditions
- Function name: `recoverAddress(bytes32,bytes)`
- PC address: 290
- Estimated Gas Usage: 304 - 682

### Description

This binary add operation can result in integer overflow.
In file: ComputeConditions.sol:37

### Code

```
e
    );
    event ProofOfUploadValid(
        bytes32 agreementId, 
        address consumer, 
        address publisher
    );
    event ProofOfUploadInvalid(
        bytes32 agreementId, 
       
```

## External call
- SWC ID: 107
- Type: Informational
- Contract: ComputeConditions
- Function name: `fallback`
- PC address: 472
- Estimated Gas Usage: 1456 - 2587

### Description

The contract executes a function call to an external address. Verify that the code at this address is trusted and immutable.
In file: ComputeConditions.sol:52

### Code

```
agreementStorage.getAgreementConsumer(agreementId)
```

## External call
- SWC ID: 107
- Type: Informational
- Contract: ComputeConditions
- Function name: `fulfillUpload(bytes32,bool)`
- PC address: 1923
- Estimated Gas Usage: 1463 - 2594

### Description

The contract executes a function call to an external address. Verify that the code at this address is trusted and immutable.
In file: ComputeConditions.sol:68

### Code

```
agreementStorage.getAgreementPublisher(agreementId)
```

## External call
- SWC ID: 107
- Type: Informational
- Contract: ComputeConditions
- Function name: `submitAlgorithmHash(bytes32,bytes32)`
- PC address: 4902
- Estimated Gas Usage: 1464 - 2595

### Description

The contract executes a function call to an external address. Verify that the code at this address is trusted and immutable.
In file: ComputeConditions.sol:60

### Code

```
agreementStorage.getAgreementPublisher(agreementId)
```

# Analysis results for Common.sol

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: Common
- Function name: `fallback`
- PC address: 108
- Estimated Gas Usage: 136 - 324

### Description

This binary add operation can result in integer overflow.
In file: Common.sol:31

### Code

```
function recoverAddress(bytes32 hash, bytes signature)
        public pure
        returns (
            address recoveredAddress
        )
    {
        return ECDSA.recover(hash, signature);
    }
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: Common
- Function name: `fallback`
- PC address: 113
- Estimated Gas Usage: 148 - 336

### Description

This binary add operation can result in integer overflow.
In file: Common.sol:31

### Code

```
function recoverAddress(bytes32 hash, bytes signature)
        public pure
        returns (
            address recoveredAddress
        )
    {
        return ECDSA.recover(hash, signature);
    }
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: Common
- Function name: `fallback`
- PC address: 120
- Estimated Gas Usage: 173 - 361

### Description

This binary add operation can result in integer overflow.
In file: Common.sol:31

### Code

```
function recoverAddress(bytes32 hash, bytes signature)
        public pure
        returns (
            address recoveredAddress
        )
    {
        return ECDSA.recover(hash, signature);
    }
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: Common
- Function name: `fallback`
- PC address: 122
- Estimated Gas Usage: 179 - 367

### Description

This binary add operation can result in integer overflow.
In file: Common.sol:31

### Code

```
function recoverAddress(bytes32 hash, bytes signature)
        public pure
        returns (
            address recoveredAddress
        )
    {
        return ECDSA.recover(hash, signature);
    }
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: Common
- Function name: `fallback`
- PC address: 145
- Estimated Gas Usage: 244 - 622

### Description

This binary add operation can result in integer overflow.
In file: Common.sol:31

### Code

```
function recoverAddress(bytes32 hash, bytes signature)
        public pure
        returns (
            address recoveredAddress
        )
    {
        return ECDSA.recover(hash, signature);
    }
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: Common
- Function name: `prefixHash(bytes32)`
- PC address: 548
- Estimated Gas Usage: 191 - 379

### Description

This binary add operation can result in integer overflow.
In file: Common.sol:40

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: Common
- Function name: `prefixHash(bytes32)`
- PC address: 557
- Estimated Gas Usage: 215 - 498

### Description

This binary add operation can result in integer overflow.
In file: Common.sol:40

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: Common
- Function name: `prefixHash(bytes32)`
- PC address: 575
- Estimated Gas Usage: 266 - 832

### Description

This binary add operation can result in integer overflow.
In file: Common.sol:40

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: Common
- Function name: `prefixHash(bytes32)`
- PC address: 590
- Estimated Gas Usage: 308 - 1062

### Description

This binary add operation can result in integer overflow.
In file: Common.sol:40

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: Common
- Function name: `prefixHash(bytes32)`
- PC address: 613
- Estimated Gas Usage: 370 - 1312

### Description

This binary add operation can result in integer overflow.
In file: Common.sol:7

### Code

```
hor Ocean Pr
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: Common
- Function name: `prefixHash(bytes32)`
- PC address: 619
- Estimated Gas Usage: 385 - 1327

### Description

This binary add operation can result in integer overflow.
In file: Common.sol:3

### Code

```


/**
 * @ti
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: Common
- Function name: `prefixHash(bytes32)`
- PC address: 621
- Estimated Gas Usage: 391 - 1333

### Description

This binary add operation can result in integer overflow.
In file: Common.sol:6

### Code

```
bstract Cont
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: Common
- Function name: `prefixHash(bytes32)`
- PC address: 643
- Estimated Gas Usage: 390 - 1660

### Description

This binary add operation can result in integer overflow.
In file: Common.sol:11

### Code

```
ract Common {

    /**
    * @
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: Common
- Function name: `prefixHash(bytes32)`
- PC address: 661
- Estimated Gas Usage: 441 - 1899

### Description

This binary add operation can result in integer overflow.
In file: Common.sol:40

# Analysis result for SafeMath

No issues found.
# Analysis results for FitchainConditions.sol

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: FitchainConditions
- Function name: `setVPC(bytes32,uint256)`
- PC address: 921
- Estimated Gas Usage: 271 - 886

### Description

This binary add operation can result in integer overflow.
In file: FitchainConditions.sol:184

### Code

```
models[modelId].verifierThreshold
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: FitchainConditions
- Function name: `setVPC(bytes32,uint256)`
- PC address: 927
- Estimated Gas Usage: 683 - 1298

### Description

This binary add operation can result in integer overflow.
In file: FitchainConditions.sol:184

### Code

```
models[modelId].voteCount
```

## Exception state
- SWC ID: 110
- Type: Informational
- Contract: FitchainConditions
- Function name: `setVPC(bytes32,uint256)`
- PC address: 946
- Estimated Gas Usage: 1138 - 1753

### Description

A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. Note that explicit `assert()` should only be used to check invariants. Use `require()` for regular input checking.
In file: FitchainConditions.sol:184

### Code

```
models[modelId].voteCount[voteType]
```

# Analysis result for ERC20Mintable

No issues found.
# Analysis results for AccessConditions.sol

## External call
- SWC ID: 107
- Type: Informational
- Contract: AccessConditions
- Function name: `grantAccess(bytes32,bytes32)`
- PC address: 295
- Estimated Gas Usage: 1469 - 2600

### Description

The contract executes a function call to an external address. Verify that the code at this address is trusted and immutable.
In file: AccessConditions.sol:27

### Code

```
agreementStorage.getAgreementPublisher(agreementId)
```

