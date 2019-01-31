pragma solidity 0.5.0;

import './Condition.sol';

contract HashLockCondition is Condition {

    constructor(address _conditionStoreManagerAddress) public {
        conditionStoreManager = ConditionStoreManager(_conditionStoreManagerAddress);
    }

    function hashValues(uint256 _preimage) public pure returns (bytes32) {
        return hashValues(abi.encodePacked(_preimage));
    }

    function hashValues(string memory _preimage) public pure returns (bytes32) {
        return hashValues(abi.encodePacked(_preimage));
    }

    function hashValues(bytes32 _preimage) public pure returns (bytes32) {
        return hashValues(abi.encodePacked(_preimage));
    }

    function hashValues(bytes memory _preimage) public pure returns (bytes32) {
        return keccak256(_preimage);
    }

    function fulfill(
        bytes32 _agreementId,
        uint256 _preimage
    )
        public
        returns (ConditionStoreLibrary.ConditionState)
    {
        return _fulfill(generateId(_agreementId, hashValues(_preimage)));
    }

    function fulfill(
        bytes32 _agreementId,
        string memory _preimage
    )
        public
        returns (ConditionStoreLibrary.ConditionState)
    {
        return _fulfill(generateId(_agreementId, hashValues(_preimage)));
    }

    function fulfill(
        bytes32 _agreementId,
        bytes32 _preimage
    )
        public
        returns (ConditionStoreLibrary.ConditionState)
    {
        return _fulfill(generateId(_agreementId, hashValues(_preimage)));
    }

    function _fulfill(
        bytes32 _generatedId
    )
        private
        returns (ConditionStoreLibrary.ConditionState)
    {
        return super.fulfill(
            _generatedId,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }
}
