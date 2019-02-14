pragma solidity 0.5.3;

// Contain upgraded version of the contracts for test
import '../../DIDRegistry.sol';

contract DIDRegistryChangeFunctionSignature is DIDRegistry {

    // swap _checksum with _did
    function registerAttribute(
        bytes32 _checksum,
        bytes32 _did,
        string memory _value
    )
        public
        onlyValidDIDArgs(_did, _checksum, _value)
    {
        didRegister[_did] = DIDRegister(msg.sender, block.number);
        emit DIDAttributeRegistered(
            _did,
            msg.sender,
            _checksum,
            _value,
            block.number
        );
    }
}
