pragma solidity 0.5.3;

import './ConditionStoreManager.sol';
import './TemplateStoreManager.sol';
import '../libraries/AgreementStoreLibrary.sol';
import 'zos-lib/contracts/Initializable.sol';

contract AgreementStoreManager is Initializable {

    using AgreementStoreLibrary for AgreementStoreLibrary.AgreementList;

    ConditionStoreManager private conditionStoreManager;
    TemplateStoreManager private templateStoreManager;
    AgreementStoreLibrary.AgreementList private agreementList;

    modifier onlyUniqueId(bytes32 _id) {
        require(
            !exists(_id),
            'Id already exists'
        );
        _;
    }

    modifier onlyNonZero(bytes32 _value) {
        require(
            _value != 0x0,
            'Value cannot be 0x0'
        );
        _;
    }

    function initialize(
        address _conditionStoreManagerAddress,
        address _templateStoreManagerAddress
    )
        public
        initializer()
    {
        require(
            _conditionStoreManagerAddress!= address(0),
            'Invalid condition store manager address'
        );
        require(
            _templateStoreManagerAddress!= address(0),
            'Invalid template store manager address'
        );

        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );
        templateStoreManager = TemplateStoreManager(
            _templateStoreManagerAddress
        );
    }

    function createAgreement(
        bytes32 _id,
        bytes32 _did,
        bytes32 _templateId,
        bytes32[] memory _conditionIds,
        uint[] memory _timeLocks,
        uint[] memory _timeOuts
    )
        public
        onlyUniqueId(_id)
        onlyNonZero(_did)
        returns (uint size)
    {
        require(
            templateStoreManager.exists(_templateId) == true,
            'Template must exist'
        );

        address[] memory conditionTypes =
            templateStoreManager.getConditionTypes(_templateId);

        require(
            conditionTypes.length == _conditionIds.length,
            'conditionIds has wrong length'
        );


        for (uint256 i = 0; i < conditionTypes.length; i++) {
            conditionStoreManager.createCondition(
                _conditionIds[i],
                conditionTypes[i],
                _timeLocks[i],
                _timeOuts[i]
            );
        }
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
            agreementList.agreements[_id].did != 0x0
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
