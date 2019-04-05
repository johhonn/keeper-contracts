pragma solidity 0.5.6;

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
        address[] providers;
    }

    struct DIDRegisterList {
        mapping(bytes32 => DIDRegister) didRegisters;
        bytes32[] didRegisterIds;
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

        _self.didRegisters[_did] = DIDRegister({
            owner: didOwner,
            lastChecksum: _checksum,
            lastUpdatedBy: msg.sender,
            blockNumberUpdated: block.number,
            providers: new address[](0)
        });

        return _self.didRegisterIds.length;
    }

    function addProvider
    (
        DIDRegisterList storage _self,
        bytes32 _did,
        address provider
    )
        internal
        returns(bool)
    {
        require(
            provider != address(0),
            'Invalid asset provider address'
        );

        if(!isProvider(_self, _did, provider)) {
            _self.didRegisters[_did].providers.push(provider);
        }

        return true;
    }

    function removeProvider
    (
        DIDRegisterList storage _self,
        bytes32 _did,
        address _provider
    )
        internal
        returns(bool)
    {
        require(
            _provider != address(0),
            'Invalid asset provider address'
        );

        int256 i = getProviderIndex(_self, _did, _provider);

        if(i == -1) {
            return false;
        }

        delete _self.didRegisters[_did].providers[uint256(i)];

        return true;
    }

    function isProvider
    (
        DIDRegisterList storage _self,
        bytes32 _did,
        address _provider
    )
        public
        view
        returns(bool)
    {
        int256 i = getProviderIndex(_self, _did, _provider);

        if(i == -1) {
            return false;
        }

        return true;
    }

    function getProviderIndex
    (
        DIDRegisterList storage _self,
        bytes32 _did,
        address provider
    )
        private
        view
        returns(int256 )
    {
        for(uint256 i=0; i < _self.didRegisters[_did].providers.length; i++)
        {
            if(provider == _self.didRegisters[_did].providers[i])
            {
                return int(i);
            }
        }
        return -1;
    }
}
