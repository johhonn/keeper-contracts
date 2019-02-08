pragma solidity 0.5.3;

import 'zos-lib/contracts/Initializable.sol';

contract Common is Initializable {
    /**
    * @notice getCurrentBlockNumber get block number
    * @return the current block number
    */
    function getCurrentBlockNumber()
        public
        view
        returns (uint)
    {
        return block.number;
    }
}
