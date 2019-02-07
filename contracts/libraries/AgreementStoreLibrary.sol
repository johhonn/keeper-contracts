pragma solidity 0.5.3;


library AgreementStoreLibrary {

    struct Agreement {
        bytes32 did;
        bytes32 templateId;
        bytes32[] conditionIds;
    }

    struct AgreementList {
        mapping(bytes32 => Agreement) agreements;
        bytes32[] agreementIds;
    }

    function create(
        AgreementList storage _self,
        bytes32 _id,
        bytes32 _did,
        bytes32 _templateId,
        bytes32[] memory _conditionIds
    )
        public
        returns (uint size)
    {
        _self.agreements[_id] = Agreement({
            did: _did,
            templateId: _templateId,
            conditionIds: _conditionIds
        });
        _self.agreementIds.push(_id);
        return _self.agreementIds.length;
    }
}
