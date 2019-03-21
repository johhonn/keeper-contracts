pragma solidity 0.5.3;

import './DIDRegistryLibrary.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

/**
 * @title DID Registry
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the DID Registry.
 *      https://github.com/oceanprotocol/OEPs/tree/master/7#registry
 */
contract DIDRegistry is Ownable {

    uint256 maxProvidersPerDID = 1;
    /**
     * @dev The DIDRegistry Library takes care of the basic storage functions.
     */
    using DIDRegistryLibrary for DIDRegistryLibrary.DIDRegisterList;

    /**
     * @dev state storage for the DID registry
     */
    DIDRegistryLibrary.DIDRegisterList internal didRegisterList;

    /**
     * @dev This implementation does not store _value on-chain,
     *      but emits DIDAttributeRegistered events to store it in the event log.
     */
    event DIDAttributeRegistered(
        bytes32 indexed _did,
        address indexed _owner,
        bytes32 _checksum,
        address [] indexed _providers,
        string _value,
        address _lastUpdatedBy,
        uint256 _blockNumberUpdated
    );

    /**
     * @dev DIDRegistry Initializer
     *      Initialize Ownable. Only on contract creation.
     * @param _owner refers to the owner of the contract.
     */
    function initialize(
        address _owner,
        uint256 _maxProvidersPerDID
    )
        public
        initializer
    {
        require(
            maxProvidersPerDID <= _maxProvidersPerDID,
            'Invalid max number of providers per DID'
        );
        Ownable.initialize(_owner);
        maxProvidersPerDID = _maxProvidersPerDID;
    }

    /**
     * @notice Register DID attributes.
     *
     * @dev The first attribute of a DID registered sets the DID owner.
     *      Subsequent updates record _checksum and update info.
     *
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _checksum includes a one-way HASH calculated using the DDO content.
     * @param _value refers to the attribute value, limited to 2048 bytes.
     * @return the size of the registry after the register action.
     */
    function registerAttribute (
        bytes32 _did,
        bytes32 _checksum,
        address[] memory _providers,
        string memory _value
    )
        public
        returns (uint size)
    {
        require(
            _providers.length <= maxProvidersPerDID,
            'Number of providers exceeds the limit'
        );
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
        // push providers to storage
        for(uint256 i=0; i < _providers.length; i++){
            assert(
                didRegisterList.push(_did, _providers[i])
            );
        }

        /* emitting _value here to avoid expensive storage */
        emit DIDAttributeRegistered(
            _did,
            didRegisterList.didRegisters[_did].owner,
            _checksum,
            _providers,
            _value,
            msg.sender,
            block.number
        );

        return getDIDRegistrySize();
    }

    /**
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @return the address of the DID owner.
     */
    function getDIDRegister(bytes32 _did)
        public
        view
        returns (
            address owner,
            bytes32 lastChecksum,
            address lastUpdatedBy,
            uint256 blockNumberUpdated
        )
    {
        owner = didRegisterList.didRegisters[_did].owner;
        lastChecksum = didRegisterList.didRegisters[_did].lastChecksum;
        lastUpdatedBy = didRegisterList.didRegisters[_did].lastUpdatedBy;
        blockNumberUpdated =
            didRegisterList.didRegisters[_did].blockNumberUpdated;
    }

    /**
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @return last modified (update) block number of a DID.
     */
    function getBlockNumberUpdated(bytes32 _did)
        public
        view
        returns(uint256 blockNumberUpdated)
    {
        return didRegisterList.didRegisters[_did].blockNumberUpdated;
    }

    /**
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @return the address of the DID owner.
     */
    function getDIDOwner(bytes32 _did)
        public
        view
        returns(address didOwner)
    {
        return didRegisterList.didRegisters[_did].owner;
    }

    /**
     * @return the length of the DID registry.
     */
    function getDIDRegistrySize()
        public
        view
        returns (uint size)
    {
        return didRegisterList.didRegisterIds.length;
    }

    /**
     * @return the length of the DID registry.
     */
    function getDIDRegisterIds()
        public
        view
        returns (bytes32[] memory)
    {
        return didRegisterList.didRegisterIds;
    }

}
