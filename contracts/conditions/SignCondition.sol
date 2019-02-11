pragma solidity 0.5.3;

import './Condition.sol';
import '../libraries/ConditionStoreLibrary.sol';
import 'openzeppelin-eth/contracts/cryptography/ECDSA.sol';
import 'zos-lib/contracts/Initializable.sol';

contract SignCondition is Condition {

    function initialize(address _conditionStoreManagerAddress)
        public
        initializer()
    {
        require(
            _conditionStoreManagerAddress != address(0),
            'Invalid address'
        );
        conditionStoreManager =
            ConditionStoreManager(_conditionStoreManagerAddress);
    }

    function hashValues(bytes32 message, address publicKey)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(message, publicKey));
    }

    function hashValues(string memory message, address publicKey)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(message, publicKey));
    }

    function hashValues(bytes memory message, address publicKey)
        public
        pure
        returns (bytes32)
    {
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
        return fulfill(
            generateId(_agreementId, hashValues(_message, _publicKey)),
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }
}
