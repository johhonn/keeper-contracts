pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import 'zos-lib/contracts/Initializable.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

/**
 * @title Common functions
 * @author Ocean Protocol Team
 */
contract Common is Ownable {
   
   /**
     * @dev Common Initializer
     *      Initialize Ownable. Only on contract creation.
     * @param _owner refers to the owner of the contract.
     */
    function initialize(
        address _owner
    )
        public
        initializer
    {
        Ownable.initialize(_owner);
    }
   
   /**
    * @notice getCurrentBlockNumber get block number
    * @return the current block number
    */
    function getCurrentBlockNumber()
        external
        view
        returns (uint)
    {
        return block.number;
    }

    /**
     * @dev isContract detect whether the address is 
     *          is a contract address or externally owned account
     * @return true if it is a contract address
     */
    function isContract(address addr)
        public
        view
        returns (bool)
    {
        uint size;
        /* solium-disable-next-line security/no-inline-assembly */
        assembly { size := extcodesize(addr) }
        return size > 0;
    }
    
    /**
     * @dev hashString calculate string hash
     * @param input input string 
     * @return bytes32 hash value
     */
    function hashString(string memory input)
        public
        pure
        returns(bytes32 hash)
    {
        hash = keccak256(abi.encodePacked(input));
    }
}
