pragma solidity 0.5.3;

contract TemplateStore {

    enum TemplateState { Uninitialized, Initialized, Created, Revoked }

    struct Template {
        TemplateState state;
        address owner;
        mapping(address => address[]) conditions;
    }

    mapping(bytes32 => Template) internal templates;

    modifier onlyTemplateOwner(bytes32 templateId){
        require(
            templates[templateId].owner == msg.sender,
            'invalid template owner'
        );
        _;
    }

    modifier onlyValidTemplateId(bytes32 templateId){
        require(
            templates[templateId].state == TemplateState.Uninitialized,
            'invalid template initialization'
        );
        _;
    }

    function setup(bytes32 templateId)
    public
    onlyValidTemplateId(templateId)
    {
        templates[templateId].state = TemplateState.Initialized;
        templates[templateId].owner = msg.sender;
    }

    function addConditionType(
        bytes32 templateId,
        address conditionType
    )
    public
    onlyTemplateOwner(templateId)
    returns(bool){
        require(
            templates[templateId].conditions[conditionType].length == 0,
            'condition already exists'
        );
        templates[templateId].conditions[conditionType] = new address[](0);
        return true;
    }

    function addRewardType(
        bytes32 templateId,
        address conditionType,
        address rewardType
    )
    public
    onlyTemplateOwner(templateId)
    returns(bool){
        templates[templateId].conditions[conditionType].push(rewardType);
        return true;
    }

    function commit(bytes32 templateId)
    public
    onlyTemplateOwner(templateId)
    returns(bool) {
        templates[templateId].state = TemplateState.Created;
        return true;
    }

    function revoke(bytes32 templateId)
    public
    onlyTemplateOwner(templateId){
        templates[templateId].state = TemplateState.Revoked;
    }

}
