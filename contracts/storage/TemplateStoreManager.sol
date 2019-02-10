pragma solidity 0.5.3;

import '../libraries/TemplateStoreLibrary.sol';
import 'zos-lib/contracts/Initializable.sol';

contract TemplateStoreManager is Initializable {

    using TemplateStoreLibrary for TemplateStoreLibrary.TemplateList;

    TemplateStoreLibrary.TemplateList private templateList;

    modifier onlyTemplateOwner(bytes32 _id){
        require(
            templateList.templates[_id].lastUpdatedBy == msg.sender,
            'Invalid UpdateRole'
        );
        _;
    }

    function createTemplate(
        bytes32 _id,
        address[] memory _conditionTypes
    )
        public
        returns (uint size)
    {
        return templateList.create(
            _id,
            _conditionTypes
        );
    }

    function getTemplate(bytes32 _id)
        external
        view
        returns (
            TemplateStoreLibrary.TemplateState state,
            address owner,
            address[] memory conditionTypes,
            address lastUpdatedBy,
            uint blockNumberUpdated
        )
    {
        state = templateList.templates[_id].state;
        owner = templateList.templates[_id].owner;
        conditionTypes = templateList.templates[_id].conditionTypes;
        lastUpdatedBy = templateList.templates[_id].lastUpdatedBy;
        blockNumberUpdated = templateList.templates[_id].blockNumberUpdated;
    }

    function getConditionTypes(bytes32 _id) public view returns (address[] memory) {
        return templateList.templates[_id].conditionTypes;
    }

    function getTemplateListSize() public view returns (uint size) {
        return templateList.templateIds.length;
    }

    function isTemplateActive(bytes32 _id) public view returns (bool) {
        return templateList.templates[_id].state == TemplateStoreLibrary.TemplateState.Active;
    }

    function revoke(bytes32 _id)
        public
        onlyTemplateOwner(_id)
    {
        return templateList.revoke(_id);
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

}
