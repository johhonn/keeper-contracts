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

    /**
     * @dev The DIDRegistry Library takes care of the basic storage functions.
     */
    using DIDRegistryLibrary for DIDRegistryLibrary.DIDRegisterList;

    /**
     * @dev state storage for the DID registry
     */
    DIDRegistryLibrary.DIDRegisterList internal didRegisterList;

    modifier onlyDIDOwner(bytes32 _did)
    {
        require(
            msg.sender == didRegisterList.didRegisters[_did].owner,
            'Invalid DID owner'
        );
        _;
    }

    /**
     * @dev This implementation does not store _value on-chain,
     *      but emits DIDAttributeRegistered events to store it in the event log.
     */
    event DIDAttributeRegistered(
        bytes32 indexed _did,
        address indexed _owner,
        bytes32 indexed _checksum,
        string _value,
        address _lastUpdatedBy,
        uint256 _blockNumberUpdated
    );

    event DIDProviderRemoved(
        bytes32 _did,
        address _provider,
        bool state
    );

    event DIDProviderAdded(
        bytes32 _did,
        address _provider
    );

    /**
     * @dev DIDRegistry Initializer
     *      Initialize Ownable. Only on contract creation.
     * @param _owner refers to the owner of the contract.
     */
    function initialize(
        address _owner
    )
        public
        initializer
    {
        Ownable.initialize(_owner);
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
    function registerAttribute(
        bytes32 _did,
        bytes32 _checksum,
        address[] memory _providers,
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

        uint updatedSize = didRegisterList.update(_did, _checksum);

        // push providers to storage
        for (uint256 i = 0; i < _providers.length; i++) {
            bool providerAdded = didRegisterList.addProvider(
                _did,
                _providers[i]
            );

            require(
                providerAdded,
                'provider was not added'
            );
        }

        /* emitting _value here to avoid expensive storage */
        emit DIDAttributeRegistered(
            _did,
            didRegisterList.didRegisters[_did].owner,
            _checksum,
            _value,
            msg.sender,
            block.number
        );

        return updatedSize;
    }

    function addDIDProvider(
        bytes32 _did,
        address _provider
    )
        external
        onlyDIDOwner(_did)
    {
        bool providerAdded =
            didRegisterList.addProvider(_did, _provider);

        require(
            providerAdded,
            'provider was not added'
        );

        emit DIDProviderAdded(
            _did,
            _provider
        );
    }

    function removeDIDProvider(
        bytes32 _did,
        address _provider
    )
        external
        onlyDIDOwner(_did)
    {
        bool state = didRegisterList.removeProvider(_did, _provider);

        emit DIDProviderRemoved(
            _did,
            _provider,
            state
        );
    }

    function isDIDProvider
    (
        bytes32 _did,
        address _provider
    )
        public
        view
        returns (bool)
    {
        return didRegisterList.isProvider(_did, _provider);
    }

    /**
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @return the address of the DID owner.
     */
    function getDIDRegister(
        bytes32 _did
    )
        public
        view
        returns (
            address owner,
            bytes32 lastChecksum,
            address lastUpdatedBy,
            uint256 blockNumberUpdated,
            address[] memory providers
        )
    {
        owner = didRegisterList.didRegisters[_did].owner;
        lastChecksum = didRegisterList.didRegisters[_did].lastChecksum;
        lastUpdatedBy = didRegisterList.didRegisters[_did].lastUpdatedBy;
        blockNumberUpdated =
        didRegisterList.didRegisters[_did].blockNumberUpdated;
        providers = didRegisterList.didRegisters[_did].providers;
    }

    /**
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @return last modified (update) block number of a DID.
     */
    function getBlockNumberUpdated(bytes32 _did)
        public
        view
        returns (uint256 blockNumberUpdated)
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
        returns (address didOwner)
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
