pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './interfaces/IList.sol';
import './libraries/HashListLibrary.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

/**
 * @title HashList contract
 * @author Ocean Protocol Team
 * @dev Hash list contract is a sample list contract in which uses 
 *      ListLibrary.sol in order to store, retrieve, remove, and 
 *      update bytes32 hashes list
 */

contract HashList is Ownable, IList {
    
    using HashListLibrary for HashListLibrary.List;        
    HashListLibrary.List list;
    
    /**
     * @dev HashList Initializer
     * @param _owner The owner of the hash list
     * Runs only on initial contract creation.
     */
    function initialize(
        address _owner
    )
        public
    {
        list.setOwner(msg.sender);
        Ownable.initialize(_owner);
    }
    
    /**
     * @dev hash ethereum accounts
     * @param account Ethereum address
     * @return bytes32 hash of the account
     */
    function hash(address account)
        external
        pure
        returns(bytes32)
    {
        return keccak256(abi.encodePacked(account));
    }
    
    /**
     * @dev put an array of elements without indexing
     *      this meant to save gas in case of large arrays
     * @param values is an array of elements value
     * @return true if values are added successfully
     */
    function add(
        bytes32[] calldata values
    )
        external
        returns(bool)
    {
        return list.add(values);
    }
    
    /**
     * @dev add index an element then add it to a list
     * @param value is a bytes32 value
     * @return true if value is added successfully
     */
    function add(
        bytes32 value
    )
        external
        returns(bool)
    {
        return list.add(value);
    }
    
    /**
     * @dev update the value with a new value and maintain indices
     * @param oldValue is an element value in a list
     * @param newValue new value
     * @return true if value is updated successfully
     */
    function update(
        bytes32 oldValue,
        bytes32 newValue
    )
        external
        returns(bool)
    {
        return list.update(oldValue, newValue);
    }
    
    /**
     * @dev index is used to map each element value to its index on the list 
     * @param from index is where to 'from' indexing in the list
     * @param to index is where to stop indexing
     * @return true if the sub list is indexed
     */
    function index(
        uint256 from,
        uint256 to
    )
        external
        returns(bool)
    {
        return list.index(from, to);
    }
    
    /**
     * @dev size returns the list size
     * @param value is element value in list
     * @return true if the value exists
     */
    function has(
        bytes32 value
    ) 
        external 
        view
        returns(bool)
    {
        return list.has(value);
    }
    /**
     * @dev remove value from a list, updates indices, and list size 
     * @param value is an element value in a list
     * @return true if value is removed successfully
     */ 
    function remove(
        bytes32 value
    )
        external
        returns(bool)
    {
        return list.remove(value);
    }
    
    /**
     * @dev has value by index 
     * @param _index is where is value is stored in the list
     * @return the value if exists
     */
    function get(
        uint256 _index
    )
        external
        view
        returns(bytes32)
    {
        return list.get(_index);
    }
    
    /**
     * @dev size gets the list size
     * @return total length of the list
     */
    function size()
        external
        view
        returns(uint256)
    {
        return list.size();
    }
    
    /**
     * @dev all returns all list elements
     * @return all list elements
     */
    function all()
        external
        view
        returns(bytes32[] memory)
    {
        return list.all();
    }
    
    /**
     * @dev indexOf gets the index of a value in a list
     * @param value is element value in list
     * @return value index in list
     */
    function indexOf(
        bytes32 value
    )
        external
        view
        returns(uint256)
    {
        return list.indexOf(value);
    }
    
    /**
     * @dev ownedBy gets the list owner
     * @return list owner
     */
    function ownedBy()
        external
        view
        returns(address)
    {
        return list.ownedBy();
    }
    
    /**
     * @dev isIndexed checks if the list is indexed
     * @return true if the list is indexed
     */
    function isIndexed()
        external
        view
        returns(bool)
    {
        return list.isIndexed();
    }
}
