pragma solidity 0.5.3;

import './Template.sol';
import '../storage/TemplateStore.sol';

contract AccessTemplate is Template {

    bool private initialized = false;

    modifier canCreateOnlyOnce(){
        require(
            !initialized,
            'Template was already created'
        );
        _;
    }

    constructor(address _templateStore) public {
        templateStore = TemplateStore(_templateStore);
    }

    function create(
        bytes32 templateId,
        address[] memory conditionTypes,
        address[] memory rewardTypes
    )
    public
    canCreateOnlyOnce
    {
        super._create(templateId, conditionTypes, rewardTypes);
        initialized = true;
    }

    function revoke(bytes32 templateId) public onlyOwner {
        super._revoke(templateId);
    }

}
