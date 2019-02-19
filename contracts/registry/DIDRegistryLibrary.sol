pragma solidity 0.5.3;

/**
 * @title DID Registry
 * @author Ocean Protocol Team
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
    * @dev this function updates DID attributes
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param _checksum includes a one-way HASH calculated using the DDO content
    */
    function update (
        DIDRegisterList storage _self,
        bytes32 _did,
        bytes32 _checksum
    )
        public
        returns (uint size)
    {
        address owner = _self.didRegisters[_did].owner;
        if (owner == address(0x0)) owner = msg.sender;

        _self.didRegisters[_did] = DIDRegister({
            owner: owner,
            lastChecksum: _checksum,
            lastUpdatedBy: msg.sender,
            blockNumberUpdated: block.number
        });

        _self.didRegisterIds.push(_did);
        return _self.didRegisterIds.length;
    }
}
