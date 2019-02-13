pragma solidity 0.5.3;

import '../libraries/IEpochLibrary.sol';
import 'openzeppelin-eth/contracts/math/SafeMath.sol';

library EpochLibraryUpgrade {

    using SafeMath for uint256;

    function initialize() public {}

   /**
    * @notice create creates new Epoch
    * @param _self is the Epoch storage pointer
    * @param _timeLock value in block count (can not fulfill before)
    * @param _timeOut value in block count (can not fulfill after)
    */
    function create(
        IEpochLibrary.EpochList storage _self,
        bytes32 _id,
        uint256 _timeLock,
        uint256 _timeOut
    )
//        internal
        public
        returns (uint size)
    {
        require(
            _timeLock >= 0,
            'Invalid time margin'
        );
        require(
            _timeOut >= 0,
            'Invalid time margin'
        );
        if(_timeOut > 0 && _timeLock > 0){
            require(
                _timeLock < _timeOut,
                'Invalid time margin'
            );
        }
        _self.epochs[_id] = IEpochLibrary.Epoch({
            timeLock: _timeLock,
            timeOut: _timeOut,
            blockNumber: 1984
        });
        _self.epochIds.push(_id);
        return _self.epochIds.length;
    }

   /**
    * @notice isTimedOut means you cannot fulfill after
    * @param _self is the Epoch storage pointer
    * @return true if the current block number is gt timeOut
    */
    function isTimedOut(
        IEpochLibrary.EpochList storage _self,
        bytes32 _id
    )
        public
        view
        returns(bool)
    {
        if (_self.epochs[_id].timeOut == 0)
            return false;
        return (block.number > getEpochTimeOut(_self.epochs[_id]));
    }

   /**
    * @notice isTimeLocked means you cannot fulfill before
    * @param _self is the Epoch storage pointer
    * @return true if the current block number is gt timeLock
    */
    function isTimeLocked(
        IEpochLibrary.EpochList storage _self,
        bytes32 _id
    )
        public
        view
        returns(bool)
    {
        return (block.number < getEpochTimeLock(_self.epochs[_id]));
    }

   /**
    * @notice getEpochTimeOut
    * @param _self is the Epoch storage pointer
    */
    function getEpochTimeOut(
        IEpochLibrary.Epoch storage _self
    )
        public
        view
        returns(uint256)
    {
        return _self.timeOut.add(_self.blockNumber);
    }

    /**
    * @notice getEpochTimeLock
    * @param _self is the Epoch storage pointer
    */
    function getEpochTimeLock(
        IEpochLibrary.Epoch storage _self
    )
        public
        view
        returns(uint256)
    {
        return _self.timeLock.add(_self.blockNumber);
    }
}
