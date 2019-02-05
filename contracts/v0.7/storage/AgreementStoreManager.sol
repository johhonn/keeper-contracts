pragma solidity 0.5.3;

import './ConditionStoreManager.sol';
import '../libraries/AgreementStoreLibrary.sol';
import 'zos-lib/contracts/Initializable.sol';

contract AgreementStoreManager is Initializable {

    using AgreementStoreLibrary for AgreementStoreLibrary.AgreementList;

    ConditionStoreManager private conditionStoreManager;
    AgreementStoreLibrary.AgreementList private agreementList;

    modifier uniqueId(bytes32 _id) {
        require(
            !exists(_id),
            'Id already exists'
        );
        _;
    }

    constructor(address _conditionStoreManagerAddress) public {
        conditionStoreManager = ConditionStoreManager(_conditionStoreManagerAddress);
    }

    function createAgreement(
        bytes32 _id,
        bytes32 _did,
        bytes32 _templateId,
        bytes32[] memory _conditionIds
    )
        public
        uniqueId(_id)
        returns (uint size)
    {
        return agreementList.create(
            _id,
            _did,
            _templateId,
            _conditionIds
        );
    }

    function exists(bytes32 _id)
        public
        view
        returns (bool)
    {
        return (
            agreementList.agreements[_id].templateId != 0x0
        );
    }

    function getAgreement(bytes32 _id)
        external
        view
        returns (
            bytes32 did,
            bytes32 templateId,
            bytes32[] memory conditionIds
        )
    {
        did = agreementList.agreements[_id].did;
        templateId = agreementList.agreements[_id].templateId;
        conditionIds = agreementList.agreements[_id].conditionIds;
    }

    function getAgreementListSize() public view returns (uint size) {
        return agreementList.agreementIds.length;
    }
}
