pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import { EpochLibrary } from "../../../contracts/libraries/EpochLibrary.sol";

contract TestEpochLibrary {

    using EpochLibrary for EpochLibrary.Epoch;

    EpochLibrary.Epoch private _epoch;

    function testCreateNewEpoch()
        public
    {
        uint256 timeLock = 0;
        uint256 timeOut = 0;

        // create new Epoch
        _epoch.create(timeLock, timeOut);

        // assert
        Assert.equal(
            _epoch.getEpochTimeLock(), _epoch.getEpochTimeOut(),
            'unable to allocate Epoch'
        );
    }

    function testIsTimeOutOver()
        public
    {
        uint256 timeLock = 0;
        uint256 timeOut = 1;

        // create new Epoch
        _epoch.create(timeLock, timeOut);

        // assert
        Assert.equal(
            _epoch.isTimeOutOver(),
            false,
            'Timeout is over'
        );
    }

    function testIsTimeLockOver()
        public
    {
        uint256 timeLock = 1;
        uint256 timeOut = 2;

        // create new Epoch
        _epoch.create(timeLock, timeOut);

        // assert
        Assert.equal(
            _epoch.isTimeLockOver(),
            false,
            'TimeLock is over'
        );
    }

}
