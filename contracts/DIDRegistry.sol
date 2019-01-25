pragma solidity 0.4.25;

import 'zos-lib/contracts/Initializable.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';


/**
 * @title DID Registry
 * @author Ocean Protocol Team
 * @dev All function calls are currently implemented without side effects
 */
contract DIDRegistry is Initializable, Ownable {
    struct DIDRegister {
        address owner;
        uint updateAt;
    }

    event DIDAttributeRegistered(
        bytes32 indexed did,
        address indexed owner,
        bytes32 indexed checksum,
        string value,
        uint updatedAt
    );

    mapping(bytes32 => DIDRegister) private didRegister;

    modifier onlyValidDIDArgs(bytes32 did, bytes32 checksum, string value){
        address currentOwner = didRegister[did].owner;
        require(
            currentOwner == address(0x0) || currentOwner == msg.sender,
            'Attributes must be registered by the DID owners.'
        );
        require(
            checksum != bytes32(0),
            'Invalid checksum'
        );
        require(
            //TODO: 2048 should be changed in the future
            bytes(value).length <= 2048,
            'Invalid url size'
        );
        _;
    }

    function initialize(
        address _owner
    )
        public initializer()
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

   /**
    * @notice getUpdateAt is called by anyone.
    * @param did refers to decentralized identifier (a byte32 length ID)
    * @return last modified (update) time of a DID
    */
    function getUpdateAt(bytes32 did)
        public view
        returns(uint)
    {
        return didRegister[did].updateAt;
    }

   /**
    * @notice getOwner is called by anyone.
    * @param did refers to decentralized identifier (a byte32 length ID)
    * @return the address of the owner
    */
    function getOwner(bytes32 did)
        public view
        returns(address)
    {
        return didRegister[did].owner;
    }
}
