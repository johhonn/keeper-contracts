pragma solidity 0.5.6;

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
    
    function add(
        bytes32[] memory items
    )
        public
        onlyOwner
        returns(bool)
    {
        return data.add(items);
    }
    
    function add(
        bytes32 item
    )
        public
        onlyOwner
        returns(bool)
    {
        return data.add(item);
    }
    
    function has(
        bytes32 item
    ) 
        public 
        view
        returns(bool)
    {
        return data.has(item);
    }    
}
