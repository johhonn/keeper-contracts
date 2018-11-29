# Analysis result for DLL

No issues found.
# Analysis results for AttributeStore.sol

## Integer Overflow

- Type: Warning
- Contract: AttributeStore
- Function name: `fallback`
- PC address: 117

### Description

A possible integer overflow exists in the function `fallback`.
The addition or multiplication may result in a value higher than the maximum representable integer.
In file: AttributeStore.sol:8

### Code

```
function getAttribute(Data storage self, bytes32 _UUID, string _attrName)
    public view returns (uint) {
        bytes32 key = keccak256(abi.encodePacked(_UUID, _attrName));
        return self.store[key];
    }
```

# Analysis result for PLCRVoting

No issues found.
# Analysis result for OceanRegistry

No issues found.
# Analysis result for OceanExchange

No issues found.
# Analysis results for OceanAuth.sol

## Message call to external contract

- Type: Informational
- Contract: OceanAuth
- Function name: `verifyAccessTokenDelivery(bytes32,address,bytes32,uint8,bytes32,bytes32)`
- PC address: 1337

### Description

This contract executes a message call to to another contract. Make sure that the called contract is trusted and does not execute user-supplied code.
In file: OceanAuth.sol:63

### Code

```
market.verifyPaymentReceived(id)
```

# Analysis result for SafeMath

No issues found.
# Analysis result for OceanDispute

No issues found.
# Analysis result for BasicToken

No issues found.
# Analysis result for StandardToken

No issues found.
# Analysis results for OceanMarket.sol

## Integer Overflow

- Type: Warning
- Contract: OceanMarket
- Function name: `generateId(bytes)`
- PC address: 326

### Description

A possible integer overflow exists in the function `generateId(bytes)`.
The addition or multiplication may result in a value higher than the maximum representable integer.
In file: OceanMarket.sol:295

### Code

```
function generateId(string contents) public pure returns (bytes32) {
        // Generate the hash of input string
        return bytes32(keccak256(abi.encodePacked(contents)));
    }
```

## Exception state

- Type: Informational
- Contract: OceanMarket
- Function name: `verifyPaymentReceived(bytes32)`
- PC address: 1210

### Description

A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. This is acceptable in most situations. Note however that `assert()` should only be used to check invariants. Use `require()` for regular input checking.
In file: OceanMarket.sol:205

### Code

```
mPayments[_paymentId].state == PaymentState.Locked
```

# Analysis result for Ownable

No issues found.
# Analysis result for OceanToken

No issues found.
