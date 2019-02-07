pragma solidity 0.5.3;

library TemplateStoreLibrary {

    enum TemplateState { Uninitialized, Created, Revoked }

    struct Template {
        TemplateState state;
        address owner;
        address[] conditionTypes;
    }

    struct TemplateList {
        mapping(bytes32 => Template) templates;
        bytes32[] templateIds;
    }

    function create(
        TemplateList storage _self,
        bytes32 _id,
        address[] memory _conditionTypes
    )
        internal
        returns (uint size)
    {
        _self.templates[_id] = Template({
            state: TemplateState.Created,
            owner: msg.sender,
            conditionTypes: _conditionTypes
        });
        _self.templateIds.push(_id);
        return _self.templateIds.length;
    }
}
