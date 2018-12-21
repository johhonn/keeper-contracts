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
        bytes32 indexed key,
        string value,
        ValueType valueType,
        uint updatedAt
    );

    mapping(bytes32 => DIDRegister) private didRegister;

    constructor() Ownable() public {
    }

    function registerAttribute(
        bytes32 did,
        ValueType valueType,
        bytes32 key,
        string value
    )
        public
    {
        address currentOwner;
        currentOwner = didRegister[did].owner;
        require(
            currentOwner == address(0x0) || currentOwner == msg.sender,
            'Attributes must be registered by the DID owners.'
        );

        didRegister[did] = DIDRegister(msg.sender, block.number);
        emit DIDAttributeRegistered(
            did,
            msg.sender,
            key,
            value,
            valueType,
            block.number
        );
    }

    function getUpdateAt(bytes32 did)
        public view
        returns(uint)
    {
        return didRegister[did].updateAt;
    }

    function getOwner(bytes32 did)
        public view
        returns(address)
    {
        return didRegister[did].owner;
    }

}
