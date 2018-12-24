pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * @title DID Registry
 * @author Ocean Protocol Team
 * @dev All function calls are currently implement without side effects
 */

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

    /// @notice registerAttribute is called only by DID owner.
    /// @dev this function registers DID attributes by storing them in
    /// the system
    /// @param did , Dencentralized Identifier (a byte32 length ID)
    /// @param valueType , include DID, DID reference , URL, or DDO
    /// @param key , attribute key
    /// @param value , attribute value
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

    /// @notice getUpdateAt is called anyone.
    /// @param did , Dencentralized Identifier (a byte32 length ID)
    /// @return last modified (update) time of a DID
    function getUpdateAt(bytes32 did)
        public view
        returns(uint)
    {
        return didRegister[did].updateAt;
    }

    /// @notice getOwner is called anyone.
    /// @param did , Dencentralized Identifier (a byte32 length ID)
    /// @return the address of the owner
    function getOwner(bytes32 did)
        public view
        returns(address)
    {
        return didRegister[did].owner;
    }
}
