pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './interfaces/IList.sol';
import './libraries/HashListLibrary.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

/**
 * @title Ethereum Address Whitelisting Condition contract
 * @author Ocean Protocol Team
 * @dev Whitelisting via Ethereum addresses. The publisher or
 * agreement DID owner can specify the list of addresses to be whitelisted.
 */

contract HashList is Ownable, IList {
    
    using HashListLibrary for HashListLibrary.List;        
    HashListLibrary.List list;
    
    
    function initialize(
        address _owner
    )
        public
    {
        list.setOwner(msg.sender);
        Ownable.initialize(_owner);
    }
    
    function hash(address account)
        external
        pure
        returns(bytes32)
    {
        return keccak256(abi.encodePacked(account));
    }
    
    function add(
        bytes32[] calldata values
    )
        external
        returns(bool)
    {
        return list.add(values);
    }
    
    function add(
        bytes32 value
    )
        external
        returns(bool)
    {
        return list.add(value);
    }
    
    function update(
        bytes32 oldValue,
        bytes32 newValue
    )
        external
        returns(bool)
    {
        return list.update(oldValue, newValue);
    }
        
    function index(
        uint256 from,
        uint256 to
    )
        external
        returns(bool)
    {
        return list.index(from, to);
    }
    
    function has(
        bytes32 value
    ) 
        external 
        view
        returns(bool)
    {
        return list.has(value);
    }
    
    function remove(
        bytes32 value
    )
        external
        returns(bool)
    {
        return list.remove(value);
    }
    
    
    function get(
        uint256 _index
    )
        external
        view
        returns(bytes32)
    {
        return list.get(_index);
    }
    
    function size()
        external
        view
        returns(uint256)
    {
        return list.size();
    }
    
    function all()
        external
        view
        returns(bytes32[] memory)
    {
        return list.all();
    }
    
    function indexOf(
        bytes32 value
    )
        external
        view
        returns(uint256)
    {
        return list.indexOf(value);
    }
    
    function ownedBy()
        external
        view
        returns(address)
    {
        return list.ownedBy();
    }
    
    function isIndexed()
        external
        view
        returns(bool)
    {
        return list.isIndexed();
    }
}
