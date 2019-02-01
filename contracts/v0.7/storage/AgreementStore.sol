pragma solidity 0.5.3;

import 'zos-lib/contracts/Initializable.sol';

contract AgreementStore is Initializable {

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

    function Initialize(address conditionStoreAddress)
        public
        initializer()
    {
        require(
            conditionStoreAddress != address(0),
            'invalid condition store address'
        );
    }

    function create(
        bytes32 agreementId,
        bytes32 templateId,
        bytes32[] memory conditionIds,
        bytes32[] memory rewardIds,
        bytes32 did
    ) public returns (bool) {
        _agreements[agreementId] = Agreement(templateId, did, conditionIds, rewardIds);
        return true;
    }

    function create(bytes32 id, address[] memory conditionTypes, address[] memory rewardTypes) public returns (bool) {
        _templates[id] = Template(conditionTypes, rewardTypes);
    }

    function getConditionTypes(bytes32 id) public view returns (address[] memory) {
        return _templates[id].conditionTypes;
    }

    function getRewardTypes(bytes32 id) public view returns (address[] memory) {
        return _templates[id].rewardTypes;
    }
}
