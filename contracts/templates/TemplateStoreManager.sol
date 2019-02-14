pragma solidity 0.5.3;

import './TemplateStoreLibrary.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

contract TemplateStoreManager is Ownable {

    using TemplateStoreLibrary for TemplateStoreLibrary.TemplateList;

    TemplateStoreLibrary.TemplateList private templateList;

    modifier onlyOwnerOrTemplateOwner(bytes32 _id){
        require(
            owner() == msg.sender ||
            templateList.templates[_id].owner == msg.sender,
            'Invalid UpdateRole'
        );
        _;
    }

    function proposeTemplate(
        bytes32 _id
    )
        public
        returns (uint size)
    {
        return templateList.create(_id);
    }

    function acceptTemplate(bytes32 _id)
        public
        onlyOwner
    {
        return templateList.revoke(_id);
    }

    function revokeTemplate(bytes32 _id)
        public
        onlyOwnerOrTemplateOwner(_id)
    {
        return templateList.revoke(_id);
    }

    function getTemplate(bytes32 _id)
        external
        view
        returns (
            TemplateStoreLibrary.TemplateState state,
            address owner,
            address lastUpdatedBy,
            uint blockNumberUpdated
        )
    {
        state = templateList.templates[_id].state;
        owner = templateList.templates[_id].owner;
        lastUpdatedBy = templateList.templates[_id].lastUpdatedBy;
        blockNumberUpdated = templateList.templates[_id].blockNumberUpdated;
    }

    function getTemplateListSize() public view returns (uint size) {
        return templateList.templateIds.length;
    }

    function isTemplateActive(bytes32 _id) public view returns (bool) {
        return templateList.templates[_id].state ==
            TemplateStoreLibrary.TemplateState.Active;
    }
}
