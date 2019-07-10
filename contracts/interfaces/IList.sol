pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/**
 * @title List Interface
 * @author Ocean Protocol Team
 */
interface IList {

    function add(
        bytes32[] calldata values
    )
        external
        returns(bool);
    
    function add(
        bytes32 value
    )
        external
        returns(bool);
        
    function remove(
        bytes32 value
    )
        external
        returns(bool);
    
    function update(
        bytes32 oldValue,
        bytes32 newValue
    )
        external
        returns(bool);
    
    function index(
        uint256 from,
        uint256 to
    )
        external
        returns(bool);
        
    function has(
        bytes32 value
    ) 
        external 
        view
        returns(bool);
    
    function size()
        external
        view
        returns(uint256);
        
    function get(
        uint256 _index
    )
        external
        view
        returns(bytes32);
    
    function all()
        external
        view
        returns(bytes32[] memory);
    
    function indexOf(
        bytes32 value 
    )
        external
        view
        returns(uint256);
        
    function ownedBy()
        external
        view
        returns(address);
        
    function isIndexed()
        external
        view
        returns(bool);
}
