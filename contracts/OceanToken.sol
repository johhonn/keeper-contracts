pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

/**
 * @title Ocean ERC20 Token
 * @author Ocean Protocol Team
 * @dev All function calls are currently implement without side effects
 */

contract OceanToken is ERC20 {

    using SafeMath for uint256;

    // ============
    // DATA STRUCTURES:
    // ============
    string public constant name = 'OceanToken';                      // Set the token name for display
    string public constant symbol = 'OCN';                           // Set the token symbol for display

    // SUPPLY
    uint8 public constant decimals = 18;                             // Set the number of decimals for display
    uint256 public constant TOTAL_SUPPLY = 1400000000 * 10 ** 18;    // OceanToken total supply

    // EMIT TOKENS
    address public receiver = address(0);                           // address to receive TOKENS
    uint256 public totalSupply;                                      // total supply of Ocean tokens including 
                                                                     // initial tokens plus block rewards

    /**
    * @dev OceanToken Constructor
    * Runs only on initial contract creation.
    */
    constructor() public {
        totalSupply = TOTAL_SUPPLY;
    }

    /**
    * @dev setReceiver set the address to receive the emitted tokens
    * @param to The address to send tokens
    * @return success setting is successful.
    */
    function setReceiver(address to) public returns (bool success){
        // make sure receiver is not set already
        require(receiver == address(0), 'Receiver address already set.');
        // Creator address is assigned initial available tokens
        super._mint(to, TOTAL_SUPPLY);
        // set receiver
        receiver = to;
        return true;
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
