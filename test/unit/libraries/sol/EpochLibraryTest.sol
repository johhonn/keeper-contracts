pragma solidity 0.5.3;

import '../../../../contracts/libraries/EpochLibrary.sol';

contract EpochLibraryTest{

    using EpochLibrary for EpochLibrary.EpochList;

    EpochLibrary.EpochList private epochList;

    uint256 bigNumberDoesNotFail;

    function beforeEach() public {
        // deducting 9935 (because we expecting to addition to the block.number)
        // the maximum unit256 number is 2^256 - 1 = 115792089237316195423570985008687907853269984665640564039457584007913129639935
        bigNumberDoesNotFail = 115792089237316195423570985008687907853269984665640564039457584007913129630000;
    }

    function testBigNumberShouldNotFail() public {
        require(
            epochList.create(keccak256(abi.encodePacked(block.number)),0, bigNumberDoesNotFail) == 1,
            'Indicating BigNumber!'
        );
    }
}
