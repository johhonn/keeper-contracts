pragma solidity 0.5.3;

// Contain upgraded version of the contracts for test
import "../../DIDRegistry.sol";

contract DIDRegistryChangeInStorageAndLogic is DIDRegistry {

    // New variables should be added after the last variable
    // Old variables should be kept even if unused
    // https://github.com/jackandtheblockstalk/upgradeable-proxy#331-you-can-1
    mapping(bytes32 => uint256) public timeOfRegister;

    function registerAttribute(
        bytes32 _did,
        bytes32 _checksum,
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
        timeOfRegister[_did] = block.number;
    }
}
