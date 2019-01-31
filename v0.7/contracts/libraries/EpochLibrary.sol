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
        uint256 timeOut)
    {
        uint256 currentBlock = getCurrentBlockNumber();
        if(timeOut > 0 && timeLock > 0){
            require(
                timeLock.add(currentBlock) < timeOut.add(currentBlock),
                'Invalid time margin'
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


    function isTimeOutOver(Epoch storage _self)
        public
        view
        returns(bool)
    {
        if(_self.timeOut == 0 || _self.timeOut.add(_self.blockNumber) > getCurrentBlockNumber())
            return false;
        return true;
    }

    function isTimeLockOver(Epoch storage _self)
        public
        view
        returns(bool)
    {
        if(_self.timeLock == 0 || _self.timeLock.add(_self.blockNumber) > getCurrentBlockNumber())
            return false;
        return true;
    }


    function getCurrentBlockNumber()
        public
        view
        returns (uint)
    {
        return block.number;
    }
}
