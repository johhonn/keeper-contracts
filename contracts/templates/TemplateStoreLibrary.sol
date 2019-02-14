pragma solidity 0.5.3;

library TemplateStoreLibrary {

    enum TemplateState { Uninitialized, Proposed, Active, Revoked }

    struct Template {
        TemplateState state;
        address owner;
        address lastUpdatedBy;
        uint256 blockNumberUpdated;
    }

    struct TemplateList {
        mapping(bytes32 => Template) templates;
        bytes32[] templateIds;
    }

    function propose(
        TemplateList storage _self,
        bytes32 _id
    )
        internal
        returns (uint size)
    {
        require(
            _self.templates[_id].blockNumberUpdated == 0,
            'Id already exists'
        );

        _self.templates[_id] = Template({
            state: TemplateState.Proposed,
            owner: msg.sender,
            conditionTypes: _conditionTypes,
            lastUpdatedBy: msg.sender,
            blockNumberUpdated: block.number
        });
        _self.templateIds.push(_id);
        return _self.templateIds.length;
    }

    function accept(
        TemplateList storage _self,
        bytes32 _id
    )
        internal
    {
        require(
            _self.templates[_id].state == TemplateState.Proposed,
            'Template not Proposed'
        );
        _self.templates[_id].state = TemplateState.Revoked;
        _self.templates[_id].lastUpdateBy = msg.sender;
        _self.templates[_id].blockNumberUpdated = block.number;
    }

    function revoke(
        TemplateList storage _self,
        bytes32 _id
    )
        internal
    {
        require(
            _self.templates[_id].state == TemplateState.Active,
            'Template not Active'
        );
        _self.templates[_id].state = TemplateState.Revoked;
        _self.templates[_id].lastUpdateBy = msg.sender;
        _self.templates[_id].blockNumberUpdated = block.number;
    }
}
