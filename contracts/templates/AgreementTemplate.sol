pragma solidity 0.5.3;

import './TemplateStoreLibrary.sol';
import '../agreements/AgreementStoreManager.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

contract AgreementTemplate is Ownable {

    using TemplateStoreLibrary for TemplateStoreLibrary.TemplateList;

    TemplateStoreLibrary.TemplateList internal templateList;
    address[] internal conditionTypes;

    AgreementStoreManager internal agreementStoreManager;

    function createAgreement(
        bytes32 _id,
        bytes32 _did,
        address _didOwner,
        bytes32[] memory _conditionIds,
        uint[] memory _timeLocks,
        uint[] memory _timeOuts
    )
        public
        returns (uint size)
    {
        return agreementStoreManager.createAgreement(
            _id,
            _did,
            _didOwner,
            getConditionTypes(),
            _conditionIds,
            _timeLocks,
            _timeOuts
        );
    }

    function getConditionTypes()
        public
        view
        returns (address[] memory)
    {
        return conditionTypes;
    }
}