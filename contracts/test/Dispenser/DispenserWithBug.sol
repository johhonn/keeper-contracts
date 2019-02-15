pragma solidity 0.5.3;

// Contain upgraded version of the contracts for test
import '../../Dispenser.sol';

contract DispenserWithBug is Dispenser {
    /**
     * @dev the Owner can set the max amount for token requests
     * @param amount the max amount of tokens that can be requested
     */
    function setMaxAmount(
        uint256 amount
    )
        public
        onlyOwner
    {
        // set max amount for each request
        maxAmount = amount;
        // add bug!
        maxAmount = 20;
    }

    /**
     * @dev the Owner can set the max amount for token requests
     * @param amount the max amount of tokens that can be requested
     */
    function setMaxMintAmount(
        uint amount
    )
        public
        onlyOwner
    {
        // set max amount for each request
        // adding bug here
        maxMintAmount = amount.mul(scale);
    }
}
