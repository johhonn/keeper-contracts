pragma solidity 0.5.0;


library EpochLibrary {

    struct Epoch {
        uint timeLock;
        uint timeOut;
        uint blockNumber;
    }

    function getCurrentBlockNumber()
        public
        view
        returns (uint)
    {
        return block.number;
    }
}
