pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/**
 * @title Condition Store Library
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Condition Store Library.
 *      
 *      Condition is a key component in the service execution agreement. 
 *      This library holds the logic for creating and updating condition 
 *      Any Condition has only four state transitions starts with Uninitialized,
 *      Unfulfilled, Fulfilled, and Aborted. Condition state transition goes only 
 *      forward from Unintialized -> Unfulfilled -> {Fulfilled || Aborted} 
 *      For more information: https://github.com/oceanprotocol/OEPs/issues/119
 *      TODO: update the OEP link
 */
library _ConditionStoreLibrary {

    enum ConditionState { Uninitialized, Unfulfilled, Fulfilled, Aborted }

    struct Condition {
        address typeRef;
        ConditionState state;
        address lastUpdatedBy;
        uint256 blockNumberUpdated;        
        uint256 EscrowValue;
        mapping (address=>uint) nonces;
    }

    struct ConditionList {
        mapping(bytes32 => Condition) conditions;
        bytes32[] conditionIds;
    }
    modifier validToModify( ConditionList storage _self){
        require(_self.conditions[_id].state == ConditionState.Unfulfilled);
        _;
    }
   /**
    * @notice create new condition
    * @dev check whether the condition exists, assigns 
    *       condition type, condition state, last updated by, 
    *       and update at (which is the current block number)
    * @param _self is the ConditionList storage pointer
    * @param _id valid condition identifier
    * @param _typeRef condition contract address
    * @return size is the condition index
    */
    function create(
        ConditionList storage _self,
        bytes32 _id,
        address _typeRef
        
    )
        internal
        returns (uint size)
    {
       return createwithValue(
          _self,
         _id,
         _typeRef,
        0
    );
    }
  /**
    * @notice create new condition
    * @dev check whether the condition exists, assigns 
    *       condition type, condition state, last updated by, 
    *       and update at (which is the current block number)
    * @param _self is the ConditionList storage pointer
    * @param _id valid condition identifier
    * @param _typeRef condition contract address
    * @return size is the condition index
    */
    function createwithValue(
        ConditionList storage _self,
        bytes32 _id,
        address _typeRef,
        uint256 _escrowValue
    )
        internal
        returns (uint size)
    {
        require(
            _self.conditions[_id].blockNumberUpdated == 0,
            'Id already exists'
        );

        _self.conditions[_id] = Condition({
            typeRef: _typeRef,
            state: ConditionState.Unfulfilled,
            lastUpdatedBy: msg.sender,
            blockNumberUpdated: block.number,
            EscrowValue: _escrowValue
        });

        _self.conditionIds.push(_id);

        return _self.conditionIds.length;
    }
    /**
    * @notice updateState update the condition state
    * @dev check whether the condition state transition is right,
    *       assign the new state, update last updated by and
    *       updated at.
    * @param _self is the ConditionList storage pointer
    * @param _id condition identifier
    * @param _newState the new state of the condition
    * @return ConditionState 
    */
    function updateState(
        ConditionList storage _self,
        bytes32 _id,
        ConditionState _newState
    )
        internal
    {
        require(
            _self.conditions[_id].state == ConditionState.Unfulfilled &&
            _newState > _self.conditions[_id].state,
            'Invalid state transition'
        );

        _self.conditions[_id].state = _newState;
        _self.conditions[_id].lastUpdatedBy = msg.sender;
        _self.conditions[_id].blockNumberUpdated = block.number;

    }
    function increaseValue(
        ConditionList storage _self,
        bytes32 _id,
        uint256 _value
        ) 
        internal
    {
       
        _self.conditions[_id].EscrowValue += _value;
    }

    function decreaseValue(
        ConditionList storage _self,
        bytes32 _id,
        uint256 _value
      )
        internal
    {
        
        require(_value<=_self.conditions[_id].EscrowValue);
        _self.conditions[_id].EscrowValue-=_value;
    }

    function incrementUserNonce(
        ConditionList storage _self,
        bytes32 _id,
        address _user
    )
    internal {
         
        _self.conditions[_id].nonces[_user]+=1;
    }
}
