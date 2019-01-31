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

    /**
    * @notice create creates new Epoch
    * @param _self is the Epoch pointer
    * @param _timeLock value in block count (can not fulfill before)
    * @param _timeOut value in block count (can not fulfill after)
    */
    function create(Epoch storage _self, uint256 _timeLock, uint256 _timeOut)
        public
        onlyValidTimeMargin(_timeLock, _timeOut)
    {
        _self.timeLock = _timeLock;
        _self.timeOut = _timeOut;
        _self.blockNumber = getCurrentBlockNumber();
    }

    /**
    * @notice isTimeOutOver means you cannot fulfill after
    * @param _self is the Epoch pointer
    * @return true if the current block number is gt timeOut
    */
    function isTimeOutOver(Epoch storage _self)
        public
        view
        returns(bool)
    {
        if(_self.timeOut == 0 || _self.timeOut.add(_self.blockNumber) > getCurrentBlockNumber())
            return false;
        return true;
    }

   /**
    * @notice isTimeLockOver means you cannot fulfill before
    * @param _self is the Epoch pointer
    * @return true if the current block number is gt timeLock
    */
    function isTimeLockOver(Epoch storage _self)
        public
        view
        returns(bool)
    {
        if(_self.timeLock == 0 || _self.timeLock.add(_self.blockNumber) > getCurrentBlockNumber())
            return false;
        return true;
    }

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
