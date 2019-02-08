pragma solidity 0.5.3;

import './Condition.sol';
import '../OceanToken.sol';
import 'zos-lib/contracts/Initializable.sol';

contract LockRewardCondition is Condition {

    OceanToken private token;

    function initialize(
        address _conditionStoreManagerAddress,
        address _tokenAddress
    )
        public
        initializer()
    {
        require(
            _tokenAddress != address(0) &&
            _conditionStoreManagerAddress != address(0),
            'Invalid address'
        );
        conditionStoreManager =
            ConditionStoreManager(_conditionStoreManagerAddress);
        token = OceanToken(_tokenAddress);
    }

    function hashValues(address rewardContractAddress, uint256 amount)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(rewardContractAddress, amount));
    }

    function fulfill(
        bytes32 agreementId,
        address rewardContractAddress,
        uint256 amount
    )
        public
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
        return fulfill(
            generateId(agreementId, hashValues(rewardContractAddress, amount)),
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }
}
