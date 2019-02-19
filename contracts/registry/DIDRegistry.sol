pragma solidity 0.5.3;

import './DIDRegistryLibrary.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

/**
 * @title DID Registry
 * @author Ocean Protocol Team
 * @dev All function calls are currently implemented without side effects
 */
contract DIDRegistry is Ownable {

    using DIDRegistryLibrary for DIDRegistryLibrary.DIDRegisterList;
    DIDRegistryLibrary.DIDRegisterList internal didRegisterList;

    event DIDAttributeRegistered(
        bytes32 indexed _did,
        address indexed _owner,
        bytes32 indexed _checksum,
        string _value,
        address _lastUpdatedBy,
        uint256 _blockNumberUpdated
    );


    function initialize(
        address _owner
    )
        public
        initializer
    {
        Ownable.initialize(_owner);
    }

   /**
    * @notice registerAttribute is called only by DID owner.
    * @dev this function registers DID attributes
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param _checksum includes a one-way HASH calculated using the DDO content
    * @param _value refers to the attribute value
    */
    function registerAttribute (
        bytes32 _did,
        bytes32 _checksum,
        string memory _value
    )
        public
        returns (uint size)
    {
        require(
            didRegisterList.didRegisters[_did].owner == address(0x0) ||
            didRegisterList.didRegisters[_did].owner == msg.sender,
            'Attributes must be registered by the DID owners.'
        );
        require(
            //TODO: 2048 should be changed in the future
            bytes(_value).length <= 2048,
            'Invalid value size'
        );
        didRegisterList.update(_did, _checksum);

        /* emitting _value here to avoid expensive storage */
        emit DIDAttributeRegistered(
            _did,
            didRegisterList.didRegisters[_did].owner,
            _checksum,
            _value,
            msg.sender,
            block.number
        );

        return getDIDRegistrySize();
    }

   /**
    * @notice getUpdateAt is called by anyone.
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @return last modified (update) time of a DID
    */
    function getBlockNumberUpdated(bytes32 _did)
        public view
        returns(uint updateAt)
    {
        return didRegisterList.didRegisters[_did].blockNumberUpdated;
    }

   /**
    * @notice getDidOwner is called by anyone.
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @return the address of the owner
    */
    function getDIDOwner(bytes32 _did)
        public view
        returns(address didOwner)
    {
        return didRegisterList.didRegisters[_did].owner;
    }

    function getDIDRegistrySize()
        public
        view
        returns (uint size)
    {
        return didRegisterList.didRegisterIds.length;
    }
}
