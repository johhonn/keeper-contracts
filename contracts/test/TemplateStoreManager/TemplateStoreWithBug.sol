pragma solidity 0.5.3;

import '../../templates/TemplateStoreManager.sol';

contract TemplateStoreWithBug is TemplateStoreManager {
    function getTemplateListSize()
        external
        view
        returns (uint size)
    {
        if (templateList.templateIds.length == 0)
            return templateList.templateIds.length;
        return 0;
    }
}
