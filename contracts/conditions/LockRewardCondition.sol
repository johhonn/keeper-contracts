pragma solidity 0.5.3;

import './Condition.sol';
import '../OceanToken.sol';
//import 'zos-lib/contracts/Initializable.sol';

contract LockRewardCondition is Condition {

    OceanToken private token;

    constructor(
        address _conditionStoreManagerAddress,
        address _tokenAddress
    )
        public
    {
        conditionStoreManager = ConditionStoreManager(_conditionStoreManagerAddress);
        token = OceanToken(_tokenAddress);
    }

        function hashValues(
        address _rewardAddress,
        uint256 _amount
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_rewardAddress, _amount));
    }

    function fulfill(
        bytes32 _agreementId,
        address _rewardAddress,
        uint256 _amount
    )
        public
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            'Could not transfer token'
        );
        require(
            token.transfer(_rewardAddress, _amount),
            'Could not transfer token'
        );
        return super.fulfill(
            generateId(_agreementId, hashValues(_rewardAddress, _amount)),
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }
}
