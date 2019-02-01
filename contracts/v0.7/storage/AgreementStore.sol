pragma solidity 0.5.3;

import '../libraries/ConditionStoreLibrary.sol';

contract AgreementStore {

    ConditionStoreLibrary internal _conditionStore;

    struct Agreement {
        bytes32 did;
        bytes32 templateId;
        bytes32[] conditionIds;
        bytes32[] rewardIds;
    }

    struct Template {
        address[] conditionTypes;
        address[] rewardTypes;
    }

    mapping(bytes32 => Template) _templates;
    mapping(bytes32 => Agreement) _agreements;

    constructor(address conditionStoreAddress) public {
        require(
            conditionStoreAddress != address(0),
            'invalid condition store address'
        );
        _conditionStore = ConditionStoreLibrary(conditionStoreAddress);
    }

    function create(
        bytes32 agreementId,
        bytes32 templateId,
        bytes32[] memory conditionIds,
        bytes32[] memory rewardIds,
        bytes32 did
    ) public returns (bool) {

//        for(uint256 i = 0; i < _templates[templateId].conditionTypes.length; i++) {
//            //TODO: replace msg.sender with condition owner
//            _conditionStore.create(
//                conditionIds[i], _templates[templateId].conditionTypes[i]);
//        }
//
//        for(uint256 j = 0; j < _templates[templateId].rewardTypes.length; j++) {
//            //TODO: replace msg.sender with condition owner
//            _conditionStore.create(rewardIds[j], _templates[templateId].rewardTypes[j]);
//        }

        _agreements[agreementId] = Agreement(
            templateId,
            did,
            conditionIds,
            rewardIds
            );
        return true;
    }

    function create(
        bytes32 id,
        address[] memory conditionTypes,
        address[] memory rewardTypes
    )
        public
        returns (bool)
    {
        _templates[id] = Template(conditionTypes, rewardTypes);
    }

    function getConditionTypes(bytes32 id)
        public
        view
        returns (address[] memory)
    {
        return _templates[id].conditionTypes;
    }

    function getRewardTypes(bytes32 id)
        public
        view
        returns (address[] memory)
    {
        return _templates[id].rewardTypes;
    }
}
