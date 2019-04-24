pragma solidity 0.5.6;


library AgreementStoreLibrary {

    struct Agreement {
        bytes32 did;
        address templateId;
        bytes32[] conditionIds;
        address lastUpdatedBy;
        uint256 blockNumberUpdated;
    }

    struct AgreementList {
        mapping(bytes32 => Agreement) agreements;
        mapping(bytes32 => bytes32[]) didToAgreementIds;
        mapping(address => bytes32[]) templateIdToAgreementIds;
        bytes32[] agreementIds;
    }

    function create(
        AgreementList storage _self,
        bytes32 _id,
        bytes32 _did,
        address _templateId,
        bytes32[] memory _conditionIds
    )
        internal
        returns (uint size)
    {
        require(
            _self.agreements[_id].blockNumberUpdated == 0,
            'Id already exists'
        );
        _self.agreements[_id] = Agreement({
            did: _did,
            templateId: _templateId,
            conditionIds: _conditionIds,
            lastUpdatedBy: msg.sender,
            blockNumberUpdated: block.number
        });
        _self.agreementIds.push(_id);
        _self.didToAgreementIds[_did].push(_id);
        _self.templateIdToAgreementIds[_templateId].push(_id);
        return _self.agreementIds.length;
    }
}
