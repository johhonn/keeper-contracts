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
        bytes32[] calldata items
    )
        external
        returns(bool);
    
    function add(
        bytes32 item
    )
        external
        returns(bool);
        
    function remove(
        bytes32 item
    )
        external
        returns(bool);
    
    function has(
        bytes32 item
    ) 
        external 
        view
        returns(bool);
    
    function size()
        external
        view
        returns(uint256);
        
    function get(
        uint256 index
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
}
