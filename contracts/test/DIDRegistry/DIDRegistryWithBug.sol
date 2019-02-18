pragma solidity 0.5.3;

// Contain upgraded version of the contracts for test
import '../../DIDRegistry.sol';

contract DIDRegistryWithBug is DIDRegistry {

    function registerAttribute(
        bytes32 _did,
        bytes32 _checksum,
        string memory _value
    )
        public
        onlyValidDIDArgs(_did, _checksum, _value)
    {
        // add bug here
        didRegister[_did] = DIDRegister(msg.sender, 42);
        emit DIDAttributeRegistered(
            _did,
            msg.sender,
            _checksum,
            _value,
            block.number
        );
    }
}
