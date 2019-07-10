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
    HashListLibrary.List data;
    
    
    function initialize(
        address owner
    )
        public
    {
        // set list owner, initialize the list
        bytes32[] memory items;
        data.add(items);
        // initialize Ownable
        Ownable.initialize(owner);
    }
    
    function add(
        bytes32[] calldata items
    )
        external
        returns(bool)
    {
        return data.add(items);
    }
    
    function add(
        bytes32 item
    )
        external
        returns(bool)
    {
        return data.add(item);
    }
    
    function has(
        bytes32 item
    ) 
        external 
        view
        returns(bool)
    {
        return data.has(item);
    }
    
    function remove(
        bytes32 item
    )
        external
        returns(bool)
    {
        return data.remove(item);
    }
    
    
    function get(
        uint256 index
    )
        external
        view
        returns(bytes32)
    {
        return data.get(index);
    }
    
    function size()
        external
        view
        returns(uint256)
    {
        return data.size();
    }
    
    function all()
        external
        view
        returns(bytes32[] memory)
    {
        return data.all();
    }
    
    function indexOf(
        bytes32 item
    )
        external
        view
        returns(uint256)
    {
        return data.indexOf(item);
    }
    
    function ownedBy()
        external
        view
        returns(address)
    {
        return data.ownedBy();
    }
}
