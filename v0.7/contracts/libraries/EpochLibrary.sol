pragma solidity 0.5.0;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

library EpochLibrary {

    using SafeMath for uint256;

    struct Epoch {
        uint256 timeLock;
        uint256 timeOut;
        uint256 blockNumber;
    }

    modifier onlyValidTimeMargin(
        uint256 timeLock,
        uint256 timeOut
    )
    {
        uint256 currentBlock = getCurrentBlockNumber();
        if(timeLock != 0 && timeOut !=0){
            require(
                timeLock >= currentBlock &&
                timeOut >= timeLock.add(currentBlock + 1),
                'Invalid time margin'
            );
        }
        else{
            require(
                timeLock == 0 && timeOut == 0,
                'Invalid time window'
            );
        }
        _;
    }

    function create(Epoch storage _self, uint256 _timeLock, uint256 _timeOut)
        public
        onlyValidTimeMargin(_timeLock, _timeOut)
    {
        _self.timeLock = _timeLock;
        _self.timeOut = _timeOut;
        _self.blockNumber = getCurrentBlockNumber();
    }

    function getCurrentBlockNumber()
        public
        view
        returns (uint)
    {
        return block.number;
    }
}
