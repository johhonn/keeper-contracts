pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/// @title Ocean DID Registry
/// @author Ocean Protocol Team
/// @dev All function calls are currently implement without side effects

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


    /// @notice registerAttribute is called only by DID owner.
    /// @dev this function registers DID attributes by storing them in
    /// the system
    /// @param _did , Dencentralized Identifier (a byte32 length ID)
    /// @param _type , include DID, DID reference , URL, or DDO
    /// @param _key , attribute key
    /// @param _value , attribute value
    function registerAttribute(bytes32 _did, ValueType _type, bytes32 _key, string _value) public {
        address currentOwner = didRegister[_did].owner;
        require(currentOwner == address(0x0) || currentOwner == msg.sender, 'Attributes must be registered by the DID owners.');
        didRegister[_did] = DIDRegister(msg.sender, block.number);
        emit DIDAttributeRegistered(_did, msg.sender, _key, _value, _type, block.number);
    }

    /// @notice getUpdateAt is called anyone.
    /// @dev a view function returns last modified (update) time of a DID
    /// @param _did , Dencentralized Identifier (a byte32 length ID)
    function getUpdateAt(bytes32 _did) public view returns(uint) {
        return didRegister[_did].updateAt;
    }

    /// @notice getOwner is called anyone.
    /// @dev a view function returns DID owner address
    /// @param _did , Dencentralized Identifier (a byte32 length ID)
    function getOwner(bytes32 _did) public view returns(address) {
        return didRegister[_did].owner;
    }

}
