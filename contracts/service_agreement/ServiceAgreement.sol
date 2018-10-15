pragma solidity ^0.4.25;


contract ServiceAgreement {

    struct Condition {
        bool state; // fulfilled or not fulfilled
        bytes32 [] dependency;
    }

    struct ServiceAgreementTemplate{
        bool state; // 1->Established 0->Revoked serviceTemplateId
        bytes32 [] conditions;
    }

    mapping (bytes32 => ServiceAgreementTemplate) templates;
    mapping (bytes32 => Condition) conditions;

    modifier noPendingFulfillments(bytes32 serviceTemplateId){
        for (uint i=0; i < templates[serviceTemplateId].conditions.length; i++){
            require(conditions[templates[serviceTemplateId].conditions[i]].state == true);
        }
        _;
    }

    modifier isValidControllerHandler(bytes32 serviceId, bytes4 fingerprint) {
        bytes32 condition = keccak256(abi.encodePacked(serviceId, msg.sender, fingerprint));
        require(conditions[condition].state != true);
        if(conditions[condition].dependency.length > 0) {
            for (uint256 i=0; i< conditions[condition].dependency.length; i++){
                require(conditions[conditions[condition].dependency[i]].state == true);
            }
        }
        _;
    }

    event SetupCondition(bytes32 serviceTemplate, bytes32 condition, bool status);
    event SetupDependencyCondition(address parent, address child);
    event SetupAgreementTemplate(bytes32 serviceTemplateId);
    event ExecuteCondition(bytes32 serviceTemplate, bytes32 condition, bool status, address provider, address consumer);
    event ConditionFulfilled(bytes32 serviceTemplate, bytes32 condition, bool status, address contractAddress, bytes4 fingerprint);

    function setupAgreement(address [] contracts, bytes4 [] fingerprints,
        uint256 [] parents, int256 [] childs, string service, address consumer) public returns (bool){
        bytes32 conditionId;
        bytes32 [] agreementConditions;
        bytes32 [] dependency;
        // generate random template service Id
        bytes32 serviceTemplateId = keccak256(abi.encodePacked(msg.sender, service, contracts.length, consumer));
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
                        emit SetupDependencyCondition(contracts[parents[i]], contracts[uint256(childs[i])]);
                        emit SetupDependencyCondition(contracts[parents[i+1]], contracts[uint256(childs[i+1])]);
                        i++;
                    }else{
                        dependency.push(keccak256(abi.encodePacked(serviceTemplateId, contracts[uint256(childs[i])], fingerprints[uint256(childs[i])])));
                        emit SetupDependencyCondition(contracts[parents[i]], contracts[uint256(childs[i])]);
                    }
                }
            }else{
                if(childs[i] != -1){
                    dependency.push(keccak256(abi.encodePacked(serviceTemplateId, contracts[uint256(childs[i])], fingerprints[uint256(childs[i])])));
                    emit SetupDependencyCondition(contracts[parents[i]], contracts[uint256(childs[i])]);
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
        emit SetupAgreementTemplate(serviceTemplateId);
        return true;
    }

    function splitSignature(bytes signature) private pure returns (uint8 v, bytes32 r, bytes32 s) {
        // Check the signature length
        require (signature.length == 65);
        // inline assembly code for splitting signature into r, v , and s.
        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(signature, 32))
            // second 32 bytes
            s := mload(add(signature, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(signature, 96)))
        }
        // check the version
        if (v < 27) {
             v += 27;
        }
        return (v, r, s);
    }

    function executeAgreement(bytes32 serviceTemplateId, bytes signature, address consumer) public returns(bool){
        // verify the consumer's signature in oder to start the execution of agreement
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        // hash of serviceTemplateId
        bytes32 message = keccak256(abi.encodePacked(serviceTemplateId));
        require(consumer == ecrecover(message, v, r, s));
        for (uint256 i=0; i< templates[serviceTemplateId].conditions.length; i++){
            emit ExecuteCondition(serviceTemplateId, templates[serviceTemplateId].conditions[i],false, msg.sender, consumer);
        }
        return true;
    }

    function fulfillAgreement(bytes32 serviceTemplateId)
        noPendingFulfillments(serviceTemplateId) public returns(bool){
        templates[serviceTemplateId].state = true;
        return true;
    }

    function setConditionStatus(bytes32 serviceId, bytes4 fingerprint)
        isValidControllerHandler(serviceId, fingerprint) public returns (bool){
        bytes32 condition = keccak256(abi.encodePacked(serviceId, msg.sender, fingerprint));
        conditions[condition].state = true;
        emit ConditionFulfilled(serviceId, condition, true, msg.sender, fingerprint);
    }

    function getConditionStatus(bytes32 conditionId) view public returns(bool){
        return conditions[conditionId].state;
    }

    function getAgreementStatus(bytes32 serviceId) view public returns(bool){
        return templates[serviceId].state;
    }

}
