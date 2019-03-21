pragma solidity 0.5.3;

/**
 * @title DID Registry Library
 * @author Ocean Protocol Team
 *
 * @dev All function calls are currently implemented without side effects
 */
library DIDRegistryLibrary {

    struct DIDRegister {
        address owner;
        bytes32 lastChecksum;
        address lastUpdatedBy;
        uint256 blockNumberUpdated;
        address [] providers;
    }

    struct DIDRegisterList {
        mapping(bytes32 => DIDRegister) didRegisters;
        bytes32[] didRegisterIds;
    }

    modifier onlyDIDOwner(DIDRegisterList storage _self, bytes32 _did)
    {
        require(
            _self.didRegisters[_did].owner == msg.sender,
            'Invalid DID owner'
        );
        _;
    }

   /**
    * @notice update the DID store
    * @dev access modifiers and storage pointer should be implemented in DIDRegistry
    * @param _self refers to storage pointer
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param _checksum includes a one-way HASH calculated using the DDO content
    */
    function update (
        DIDRegisterList storage _self,
        bytes32 _did,
        bytes32 _checksum
    )
        external
        returns (uint size)
    {
        address didOwner = _self.didRegisters[_did].owner;
        if (didOwner == address(0))
        {
            didOwner = msg.sender;
            _self.didRegisterIds.push(_did);
        }

        _self.didRegisters[_did] = DIDRegister(
            didOwner,
            _checksum,
            msg.sender,
            block.number,
            new address [](0)
        );

        return _self.didRegisterIds.length;
    }

    function push(
        DIDRegisterList storage _self,
        bytes32 _did,
        address provider
    )
        external
        onlyDIDOwner(_self, _did)
        returns(bool)
    {
        require(
            provider != address(0),
            'Invalid asset provider address'
        );
        _self.didRegisters[_did].providers.push(provider);
        return true;
    }

    function pop(
        DIDRegisterList storage _self,
        bytes32 _did,
        address provider
    )
        external
        onlyDIDOwner(_self, _did)
        returns(bool)
    {
        require(
            provider != address(0),
            'Invalid asset provider address'
        );
        for(uint256 i=0; _self.didRegisters[_did].providers.length < i; i++)
        {
            if(provider == _self.didRegisters[_did].providers[i])
            {
                delete _self.didRegisters[_did].providers[i];
                return true;
            }
        }
        return false;
    }
}
