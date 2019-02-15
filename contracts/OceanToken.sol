pragma solidity 0.5.3;

import 'openzeppelin-eth/contracts/token/ERC20/ERC20Capped.sol';
import 'openzeppelin-eth/contracts/token/ERC20/ERC20Detailed.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import 'zos-lib/contracts/Initializable.sol';


/**
 * @title Ocean Protocol ERC20 Token Contract
 * @author Ocean Protocol Team
 * @dev All function calls are currently implemented without side effects
 */
contract OceanToken is Initializable, Ownable, ERC20Detailed, ERC20Capped {

    using SafeMath for uint256;

    /**
    * @dev OceanToken Initializer
    * Runs only on initial contract creation.
    */
    function initialize(
        address _owner,
        address _initialMinter
    )
        public
        initializer
    {
        uint256 CAP = 1410000000;
        uint256 TOTALSUPPLY = CAP.mul(10 ** 18);

        ERC20Detailed.initialize('OceanToken', 'OCEAN', 18);
        ERC20Capped.initialize(TOTALSUPPLY, _owner);
        Ownable.initialize(_owner);

        // set initial minter, this has to be renounced after the setup!
        _addMinter(_initialMinter);
    }
}
