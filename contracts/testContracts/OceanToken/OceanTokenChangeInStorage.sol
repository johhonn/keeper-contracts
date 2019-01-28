pragma solidity 0.4.25;

import 'openzeppelin-eth/contracts/token/ERC20/ERC20Capped.sol';
import 'openzeppelin-eth/contracts/token/ERC20/ERC20Detailed.sol';
import 'zos-lib/contracts/Initializable.sol';


/**
 * @title Ocean Protocol ERC20 Token Contract
 * @author Ocean Protocol Team
 * @dev All function calls are currently implemented without side effects
 */
contract OceanTokenChangeInStorage
    is Initializable, ERC20Detailed, ERC20Capped
{

    using SafeMath for uint256;

    // keep track of how many times a function was called.
    mapping (address=>uint256) public called;

    /**
    * @dev OceanToken Initializer
    * Runs only on initial contract creation.
    */
    function initialize(
        address _minter
    )
        public initializer()
    {
        ERC20Detailed.initialize('OceanToken', 'OCN', 18);
        ERC20Capped.initialize(1400000000 * 10 ** 18, _minter);
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
