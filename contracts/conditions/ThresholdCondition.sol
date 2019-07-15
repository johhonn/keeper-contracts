pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './Condition.sol';

contract ThresholdCondition is Condition {
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress
    )
        external
        initializer()
    {
        require(
            _conditionStoreManagerAddress != address(0),
            'Invalid address'
        );
        Ownable.initialize(_owner);
        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );
    }

    function hashValues(
        bytes32[] memory inputConditions, 
        uint256 nInputFulfilledConditions    
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(inputConditions, nInputFulfilledConditions));
    }
    
    
    function fulfill(
        bytes32 _agreementId,
        bytes32[] calldata _inputConditions,
        uint256 nInputFulfilledConditions
    )
        external
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(
             _inputConditions.length >= 2 &&
             nInputFulfilledConditions <= _inputConditions.length,
             'Invalid input conditions length'
        );
        
        require(
            canFulfill(_inputConditions, nInputFulfilledConditions),
            'Invalid threshold fulfilment'
        );
        
        return super.fulfill(
            generateId(
                _agreementId, 
                hashValues(
                    _inputConditions, 
                    nInputFulfilledConditions
                )
            ),
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }
    
    
    function canFulfill(
        bytes32[] memory _inputConditions,
        uint256 nInputFulfilledConditions
    )
        private
        view
        returns(bool _fulfill)
    {
        uint256 counter = 0;
        _fulfill = false;
        ConditionStoreLibrary.ConditionState inputConditionState;
        for (uint i=0; i < _inputConditions.length; i++)
        { 
            (,inputConditionState,,,,,) = conditionStoreManager.getCondition(_inputConditions[i]);
            if(inputConditionState == ConditionStoreLibrary.ConditionState.Fulfilled)
                counter ++;
            if (counter >= nInputFulfilledConditions)
            {
                _fulfill = true;
                break;
            }
      }
    }
    
}
