pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract DIDRegistry is Ownable {
    enum DocumentType { Asset, Provider }

    struct Identity {
        address owner;
        DocumentType _type;
    }

    // FIXME if we index the string field (did), there gonna be problems reading it
    // via web3js - https://github.com/ethereum/web3.js/issues/434.
    event DIDAttributeRegistered(
        string did,
        address indexed owner,
        DocumentType _type,
        bytes32 indexed key,
        string value,
        uint updatedAt
    );

    mapping(string => Identity) private identities;

    constructor() Ownable() public {
    }

    function registerAttribute(string _did, DocumentType _type, bytes32 _key, string _value) public {
        address currentOwner;
        currentOwner = identities[_did].owner;
        require(currentOwner == address(0x0) || currentOwner == msg.sender, 'Attributes must be registered by the DID owners.');

        identities[_did] = Identity(msg.sender, _type);
        emit DIDAttributeRegistered(_did, msg.sender, _type, _key, _value, block.number);
    }
}
