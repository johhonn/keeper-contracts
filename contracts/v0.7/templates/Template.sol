pragma solidity 0.5.3;

import '../storage/TemplateStore.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

contract Template is Ownable {

    TemplateStore internal templateStore;

    event TemplateCreated(
        address indexed creator,
        bytes32 indexed templateId
    );

    event TemplateRevoked(
        address indexed creator,
        bytes32 indexed templateId
    );

    function _create(
        bytes32 templateId,
        address[] memory conditionTypes,
        address[] memory rewardTypes
    )
        internal
        returns (bool)
    {
        templateStore.init(templateId);
        for(uint256 i = 0; i < conditionTypes.length; i++){
            if(templateStore.addConditionType(templateId, conditionTypes[i])){
                //TODO: This example implies that condition could have multiple rewards
                if(rewardTypes[i] != address(0)){
                    templateStore.addRewardType(
                        templateId,
                        conditionTypes[i],
                        rewardTypes[i]
                    );
                }
            }

        }
        emit TemplateCreated(
            address(this),
            templateId
        );
        return templateStore.commit(templateId);
    }

    function _revoke(bytes32 templateId) internal onlyOwner returns (bool){
        templateStore.revoke(templateId);
    }
}
