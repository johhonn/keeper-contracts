pragma solidity 0.5.3;

library TemplateStoreLibrary {

    enum TemplateState { Uninitialized, Active, Revoked }

    struct Template {
        TemplateState state;
        address owner;
        address[] conditionTypes;
        address lastUpdatedBy;
        uint256 blockNumberUpdated;
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
        require(
            _self.templates[_id].blockNumberUpdated == 0,
            "Id already exists"
        );

        _self.templates[_id] = Template({
            state: TemplateState.Active,
            owner: msg.sender,
            conditionTypes: _conditionTypes,
            lastUpdatedBy: msg.sender,
            blockNumberUpdated: block.number
        });
        _self.templateIds.push(_id);
        return _self.templateIds.length;
    }
}
