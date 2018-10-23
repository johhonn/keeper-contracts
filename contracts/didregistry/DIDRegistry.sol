pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract DIDRegistry is Ownable {
    enum ValueType { 
        DID,                // DID string e.g. 'did:op:xxx'
        DIDRef,             // hash of DID same as in parameter (bytes32 _did) in text 0x0123abc.. or 0123abc..
        URL,                // URL string e.g. 'http(s)://xx'
        DDO                 // DDO string in JSON e.g. '{ "id": "did:op:xxx"...
    }

    struct DIDRegister {
        address owner;
        uint updateAt;
    }

    event DIDAttributeRegistered(
        bytes32 indexed did,
        address indexed owner,
        ValueType _type,
        bytes32 indexed key,
        string value,
        uint updatedAt
    );

    mapping(bytes32 => Identity) public didRegister;

    constructor() Ownable() public {
    }

    function registerAttribute(bytes32 _did, ValueType _type, bytes32 _key, string _value) public {
        address currentOwner;
        currentOwner = didRegister[_did].owner;
        require(currentOwner == address(0x0) || currentOwner == msg.sender, 'Attributes must be registered by the DID owners.');

        didRegister[_did] = DIDRegister(msg.sender, block.number);
        emit DIDAttributeRegistered(_did, msg.sender, _type, _key, _value, block.number);
    }
}
