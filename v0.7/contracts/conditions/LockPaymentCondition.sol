pragma solidity 0.5.0;

import './Condition.sol';
import '../OceanToken.sol';
import '../libraries/ConditionStoreLibrary.sol';

contract LockPaymentCondition is Condition {

    OceanToken private token;

    constructor(address _conditionStoreManagerAddress, address _tokenAddress) public {
        conditionStoreManager = ConditionStoreManager(_conditionStoreManagerAddress);
        token = OceanToken(_tokenAddress);
    }

    function hashValues(address rewardContractAddress, uint256 amount) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(rewardContractAddress, amount));
    }

    function fulfill(
        bytes32 agreementId,
        address rewardContractAddress,
        uint256 amount
    )
        public
        payable
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            token.transferFrom(msg.sender, address(this), amount),
            'Could not transfer token'
        );
        require(
            token.transfer(rewardContractAddress, amount),
            'Could not transfer token'
        );
        return super.fulfill(
            generateId(agreementId, hashValues(rewardContractAddress, amount)),
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }
}