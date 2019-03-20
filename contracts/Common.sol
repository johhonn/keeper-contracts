pragma solidity 0.5.3;

import 'zos-lib/contracts/Initializable.sol';

/**
 * @title Common functions
 * @author Ocean Protocol Team
 */
contract Common {
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
}
