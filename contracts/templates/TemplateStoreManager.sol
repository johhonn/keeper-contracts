pragma solidity 0.5.6;

import './TemplateStoreLibrary.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

contract TemplateStoreManager is Ownable {

    using TemplateStoreLibrary for TemplateStoreLibrary.TemplateList;

    TemplateStoreLibrary.TemplateList internal templateList;

    modifier onlyOwnerOrTemplateOwner(address _id){
        require(
            isOwner() ||
            templateList.templates[_id].owner == msg.sender,
            'Invalid UpdateRole'
        );
        _;
    }

    function initialize(
        address _owner
    )
        public
        initializer()
    {
        require(
            _owner != address(0),
            'Invalid address'
        );
        Ownable.initialize(_owner);
    }

    function proposeTemplate(address _id)
        external
        returns (uint size)
    {
        return templateList.propose(_id);
    }

    function approveTemplate(address _id)
        external
        onlyOwner
    {
        return templateList.approve(_id);
    }

    function revokeTemplate(address _id)
        external
        onlyOwnerOrTemplateOwner(_id)
    {
        return templateList.revoke(_id);
    }

    function getTemplate(address _id)
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

    function getTemplateListSize()
        external
        view
        returns (uint size)
    {
        return templateList.templateIds.length;
    }

    function isTemplateApproved(address _id) external view returns (bool) {
        return templateList.templates[_id].state ==
            TemplateStoreLibrary.TemplateState.Approved;
    }
}
