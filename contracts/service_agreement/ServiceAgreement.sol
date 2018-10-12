pragma solidity ^0.4.25;


contract ServiceAgreement {

    struct Condition {
        bool state;
        bytes32 [] dependency;
    }

    struct ServiceAgreementTemplate{
        bool state; // 1->Established 0->Revoked serviceTemplateId
        bytes32 [] conditions;
    }

    mapping (bytes32 => ServiceAgreementTemplate) templates;
    mapping (bytes32 => Condition) conditions;

    modifier noPendingFulfillments(bytes32 serviceTemplateId){
        // TODO:
        _;
    }

    modifier isValidControllerFunction(bytes32 serviceId, bytes4 fingerprint) {

        // TODO:
        _;
    }

    event SetupCondition(bytes32 serviceTemplate, bytes32 condition, bool status);
    event DependencyCondition(address parent, address child);

    function setupAgreement(address [] contracts, bytes4 [] fingerprints,
        uint256 [] parents, int256 [] childs, string service) public returns (bool){
        bytes32 conditionId;
        bytes32 [] agreementConditions;
        bytes32 [] dependency;
        // generate random template service Id
        bytes32 serviceTemplateId = keccak256(abi.encodePacked(msg.sender, service, contracts.length, fingerprints.length));
        templates[serviceTemplateId] = ServiceAgreementTemplate(false, agreementConditions);
        // the current implementation supports only binary tree
        // parents = [0, 0, 1, 1, 2,  3,  4,  5]
        // childs  = [1, 2, 3, 4, 5, -1, -1, -1]

        for (uint256 i=0; i< parents.length; i++){
            conditionId = keccak256(abi.encodePacked(serviceTemplateId, contracts[parents[i]], fingerprints[parents[i]]));
            if(i < parents.length-1){
                if(childs[i] != -1){
                    if(parents[i] == parents[i+1]){
                        dependency.push(keccak256(abi.encodePacked(serviceTemplateId, contracts[uint256(childs[i])], fingerprints[uint256(childs[i])])));
                        dependency.push(keccak256(abi.encodePacked(serviceTemplateId, contracts[uint256(childs[i+1])], fingerprints[uint256(childs[i+1])])));
                        emit DependencyCondition(contracts[parents[i]], contracts[uint256(childs[i])]);
                        emit DependencyCondition(contracts[parents[i+1]], contracts[uint256(childs[i+1])]);
                        i++;
                    }else{
                        dependency.push(keccak256(abi.encodePacked(serviceTemplateId, contracts[uint256(childs[i])], fingerprints[uint256(childs[i])])));
                        emit DependencyCondition(contracts[parents[i]], contracts[uint256(childs[i])]);

                    }
                }
            }else{
                if(childs[i] != -1){
                    dependency.push(keccak256(abi.encodePacked(serviceTemplateId, contracts[uint256(childs[i])], fingerprints[uint256(childs[i])])));
                    emit DependencyCondition(contracts[parents[i]], contracts[uint256(childs[i])]);
                }
            }
            Condition memory cond = Condition(false,dependency);
            emit SetupCondition(serviceTemplateId, conditionId, false);
            templates[serviceTemplateId].conditions.push(conditionId);
            conditions[conditionId] = cond;
            // free dependency array;
            dependency.length =0;
        }
        // TODO: whitelisting conditions (to be developed)!
        return true;
    }

    //function executeAgreement(bytes32 serviceTemplateId, bytes signature, address consumer) public returns(bool);

    //function revokeAgreement(bytes32 serviceTemplateId) noPendingFulfillments(serviceTemplateId) public returns(bool);

    //function setConditionStatus(bytes32 serviceId, bytes4 fingerprint) isValidControllerFunction(serviceId, fingerprint) public returns (bool);

    //function getConditionStatus(bytes32 conditionId) view public returns(bool);

    //function getAgreementStatus(bytes32 serviceId) view public returns(bool);

}
