pragma solidity 0.5.0;

import './Condition.sol';
import '../libraries/ConditionStoreLibrary.sol';
import 'openzeppelin-solidity/contracts/cryptography/ECDSA.sol';

contract SignCondition is Condition {

    constructor(address _conditionStoreManagerAddress) public {
        conditionStoreManager = ConditionStoreManager(_conditionStoreManagerAddress);
    }

    function hashValues(bytes32 message, address publicKey) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(message, publicKey));
    }

    function hashValues(string memory message, address publicKey) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(message, publicKey));
    }

    function hashValues(bytes memory message, address publicKey) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(message, publicKey));
    }

    function fulfill(
        bytes32 _agreementId,
        bytes32 _message,
        address _publicKey,
        bytes memory _signature
    )
        public
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            ECDSA.recover(_message, _signature) == _publicKey,
            'Could not recover signature'
        );
        return super.fulfill(
            generateId(_agreementId, hashValues(_message, _publicKey)),
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }
}
