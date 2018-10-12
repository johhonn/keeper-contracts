pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract DIDRegistry is Ownable {
    enum DocumentType { Asset, Provider }

    struct Identity {
        address owner;
        DocumentType _type;
    }

    event DIDAttributeRegistered(
        bytes32 indexed did,
        address indexed owner,
        DocumentType _type,
        bytes32 indexed key,
        string value,
        uint updatedAt
    );

    mapping(bytes32 => Identity) private identities;

    constructor() Ownable() public {
    }

    function registerAttribute(bytes32 _did, DocumentType _type, bytes32 _key, string _value) public {
        address currentOwner;
        currentOwner = identities[_did].owner;
        require(currentOwner == address(0x0) || currentOwner == msg.sender, 'Attributes must be registered by the DID owners.');

        identities[_did] = Identity(msg.sender, _type);
        emit DIDAttributeRegistered(_did, msg.sender, _type, _key, _value, block.number);
    }
}
