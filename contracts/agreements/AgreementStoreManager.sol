pragma solidity 0.5.3;

import '../conditions/ConditionStoreManager.sol';
import '../templates/TemplateStoreManager.sol';
import './AgreementStoreLibrary.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

contract AgreementStoreManager is Ownable {

    using AgreementStoreLibrary for AgreementStoreLibrary.AgreementList;

    ConditionStoreManager internal conditionStoreManager;
    TemplateStoreManager internal templateStoreManager;
    AgreementStoreLibrary.AgreementList internal agreementList;

    event AgreementCreated(
        bytes32 indexed _agreementId,
        bytes32 indexed _did,
        address indexed _sender,
        address _didOwner,
        address _templateId
    );

    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _templateStoreManagerAddress
    )
        public
        initializer()
    {
        require(
            _conditionStoreManagerAddress != address(0) &&
            _templateStoreManagerAddress != address(0) &&
            _owner != address(0),
            'Invalid address'
        );
        Ownable.initialize(_owner);
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
        address _didOwner,
        address[] memory _conditionTypes,
        bytes32[] memory _conditionIds,
        uint[] memory _timeLocks,
        uint[] memory _timeOuts
    )
        public
        returns (uint size)
    {
        require(
            templateStoreManager.isTemplateApproved(msg.sender) == true,
            'Template not Approved'
        );
        require(
            _conditionIds.length == _conditionTypes.length &&
            _timeLocks.length == _conditionTypes.length &&
            _timeOuts.length == _conditionTypes.length,
            'Arguments have wrong length'
        );

        for (uint256 i = 0; i < _conditionTypes.length; i++) {
            conditionStoreManager.createCondition(
                _conditionIds[i],
                _conditionTypes[i],
                _timeLocks[i],
                _timeOuts[i]
            );
        }
        agreementList.create(
            _id,
            _did,
            _didOwner,
            msg.sender,
            _conditionIds
        );

        emit AgreementCreated(
            _id,
            _did,
            msg.sender,
            _didOwner,
            msg.sender
        );

        return getAgreementListSize();
    }

    function getAgreement(bytes32 _id)
        external
        view
        returns (
            bytes32 did,
            address didOwner,
            address templateId,
            bytes32[] memory conditionIds,
            address lastUpdatedBy,
            uint256 blockNumberUpdated
        )
    {
        did = agreementList.agreements[_id].did;
        didOwner = agreementList.agreements[_id].didOwner;
        templateId = agreementList.agreements[_id].templateId;
        conditionIds = agreementList.agreements[_id].conditionIds;
        lastUpdatedBy = agreementList.agreements[_id].lastUpdatedBy;
        blockNumberUpdated = agreementList.agreements[_id].blockNumberUpdated;
    }

    function getAgreementDidOwner(bytes32 _id)
        external
        view
        returns (address didOwner)
    {
        return agreementList.agreements[_id].didOwner;
    }

    function getAgreementListSize()
        public
        view
        returns (uint size)
    {
        return agreementList.agreementIds.length;
    }
}
