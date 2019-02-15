pragma solidity 0.5.3;

// Contain upgraded version of the contracts for test
import '../../OceanToken.sol';
import 'openzeppelin-eth/contracts/math/SafeMath.sol';


contract OceanTokenExtraFunctionality is OceanToken {
    using SafeMath for uint256;
    //returns a number
    function incrementMintCount()
        public view
        returns(uint256)
    {
        return mintCount.add(1);
    }

    uint256 mintCount;
}
