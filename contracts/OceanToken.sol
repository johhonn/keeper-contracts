pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * @title Ocean Protocol ERC20 Token Contract
 * @author Ocean Protocol Team
 * @dev All function calls are currently implemented without side effects
 */

contract OceanToken is ERC20Capped, ERC20Detailed {

    using SafeMath for uint256;

<<<<<<< HEAD
=======
    // ============
    // DATA STRUCTURES:
    // ============

    // Set the token name for display
    string public constant name = 'OceanToken';

    // Set the token symbol for display
    string public constant symbol = 'OCN';

    // SUPPLY

    // Set the number of decimals for display
    uint8 public constant decimals = 18;

     // OceanToken total supply
    uint256 public constant TOTAL_SUPPLY = 1400000000 * 10 ** 18;

    // EMIT TOKENS
    address public receiver = address(0); // address to receive TOKENS
    uint256 public totalSupply;       // total supply of Ocean tokens including 
                                     // initial tokens plus block rewards

>>>>>>> ethlint_max-char_fix
    /**
    * @dev OceanToken Constructor
    * Runs only on initial contract creation.
    */
    constructor ()
        public
        ERC20Detailed('OceanToken', 'OCN', 18)
        ERC20Capped(1400000000 * 10 ** 18)
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
        returns (bool tokenTransferred)
    {
        require(
            to != address(0),
            'To address is 0x0.'
        );
        return super.transfer(to, value);
    }

    /**
    * @dev Transfer tokens from one address to another when not paused
    * @param from address The address which you want to send tokens from
    * @param to address The address which you want to transfer to
    * @param value uint256 the amount of tokens to be transferred
    */
    function transferFrom(
        address from,
        address to,
        uint256 value
    )
        public
        returns (bool tokenTransferred)
    {
        require(
            to != address(0),
            'To address is 0x0.'
        );
        return super.transferFrom(from, to, value);
    }

}
