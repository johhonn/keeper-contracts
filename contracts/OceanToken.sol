pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

/**
@title Ocean Protocol ERC20 Token Contract
@author Team: Fang Gong, Sebastian Gerske
*/

contract OceanToken is ERC20, ERC20Mintable, ERC20Detailed {

    using SafeMath for uint256;

    /**
    * @dev OceanToken Constructor
    * Runs only on initial contract creation.
    */
    constructor ()
        public ERC20Detailed('OceanToken', 'OCN', 18)
    {
    }

    /**
    * @dev Transfer token for a specified address when not paused
    * @param to The address to transfer to.
    * @param value The amount to be transferred.
    */
    function transfer(
        address to,
        uint256 value
    )
        public
        returns (bool)
    {
        require(
            to != address(0),
            'To address is 0x0.'
        );
        return super.transfer(to, value);
    }

    /**
    * @dev Transfer tokens from one address to another when not paused
    * @param _from address The address which you want to send tokens from
    * @param to address The address which you want to transfer to
    * @param value uint256 the amount of tokens to be transferred
    */
    function transferFrom(
        address _from,
        address to,
        uint256 value
    )
        public
        returns (bool)
    {
        require(
            to != address(0),
            'To address is 0x0.'
        );
        return super.transferFrom(_from, to, value);
    }

}
