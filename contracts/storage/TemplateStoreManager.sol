pragma solidity 0.5.3;

import '../libraries/TemplateStoreLibrary.sol';
import 'zos-lib/contracts/Initializable.sol';

contract TemplateStoreManager is Initializable {

    using TemplateStoreLibrary for TemplateStoreLibrary.TemplateList;

    TemplateStoreLibrary.TemplateList private templateList;

    modifier onlyTemplateOwner(bytes32 _id){
        require(
            templateList.templates[_id].owner == msg.sender,
            'invalid template owner'
        );
        _;
    }

    modifier onlyValidId(bytes32 _id){
        require(
            templateList.templates[_id].state ==
            TemplateStoreLibrary.TemplateState.Uninitialized,
            'invalid template initialization'
        );
        _;
    }

    function createTemplate(
        bytes32 _id,
        address[] memory _conditionTypes
    )
        public
        onlyValidId(_id)
        returns (uint size)
    {
        return templateList.create(
            _id,
            _conditionTypes
        );
    }
    
    function exists(bytes32 _id)
        public
        view
        returns (bool)
    {
        return (
            templateList.templates[_id].state >
            TemplateStoreLibrary.TemplateState.Uninitialized
        );
    }

    function getTemplate(bytes32 _id)
        external
        view
        returns (
            TemplateStoreLibrary.TemplateState state,
            address owner,
            address[] memory conditionTypes
        )
    {
        state = templateList.templates[_id].state;
        owner = templateList.templates[_id].owner;
        conditionTypes = templateList.templates[_id].conditionTypes;
    }

    function getConditionTypes(bytes32 _id)
        public
        view
        returns (address[] memory)
    {
        return templateList.templates[_id].conditionTypes;
    }

    function getTemplateListSize() public view returns (uint size) {
        return templateList.templateIds.length;
    }

//    function addConditionType(
//        bytes32 templateId,
//        address conditionType
//    )
//    public
//    onlyTemplateOwner(templateId)
//    returns(bool){
//        require(
//            templates[templateId].conditions[conditionType].length == 0,
//            'condition already exists'
//        );
//        templates[templateId].conditions[conditionType] = new address[](0);
//        return true;
//    }
//
//    function revoke(bytes32 templateId)
//    public
//    onlyTemplateOwner(templateId){
//        templates[templateId].state = TemplateState.Revoked;
//    }

}
