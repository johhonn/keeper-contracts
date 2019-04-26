pragma solidity 0.5.6;

library TemplateStoreLibrary {

    enum TemplateState { Uninitialized, Proposed, Approved, Revoked }

    struct Template {
        TemplateState state;
        uint256 blockNumberUpdated;
        address owner;
        address lastUpdatedBy;
    }

    struct TemplateList {
        mapping(address => Template) templates;
        address[] templateIds;
    }

    function propose(
        TemplateList storage _self,
        address _id
    )
        internal
        returns (uint size)
    {
        require(
            _self.templates[_id].state == TemplateState.Uninitialized,
            'Id already exists'
        );
        _self.templates[_id] = Template({
            state: TemplateState.Proposed,
            blockNumberUpdated: block.number,
            owner: msg.sender,
            lastUpdatedBy: msg.sender
        });
        _self.templateIds.push(_id);
        return _self.templateIds.length;
    }

    function approve(
        TemplateList storage _self,
        address _id
    )
        internal
    {
        require(
            _self.templates[_id].state == TemplateState.Proposed,
            'Template not Proposed'
        );
        _self.templates[_id].state = TemplateState.Approved;
        _self.templates[_id].lastUpdatedBy = msg.sender;
        _self.templates[_id].blockNumberUpdated = block.number;
    }

    function revoke(
        TemplateList storage _self,
        address _id
    )
        internal
    {
        require(
            _self.templates[_id].state == TemplateState.Approved,
            'Template not Approved'
        );
        _self.templates[_id].state = TemplateState.Revoked;
        _self.templates[_id].lastUpdatedBy = msg.sender;
        _self.templates[_id].blockNumberUpdated = block.number;
    }
}
