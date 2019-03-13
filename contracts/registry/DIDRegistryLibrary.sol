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
            blockNumberUpdated: block.number
        });

        return _self.didRegisterIds.length;
    }
}
