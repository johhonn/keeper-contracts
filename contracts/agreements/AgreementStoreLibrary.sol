pragma solidity 0.5.6;


library AgreementStoreLibrary {

    struct Agreement {
        uint256 blockNumberUpdated;
        address templateId;
        address lastUpdatedBy;
        bytes32 did;
        bytes32[] conditionIds;
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
            blockNumberUpdated: block.number,
            templateId: _templateId,
            lastUpdatedBy: msg.sender,
            did: _did,
            conditionIds: _conditionIds
        });

        _self.agreementIds.push(_id);
        _self.didToAgreementIds[_did].push(_id);
        _self.templateIdToAgreementIds[_templateId].push(_id);
        return _self.agreementIds.length;
    }
}
