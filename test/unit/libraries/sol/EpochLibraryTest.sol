pragma solidity 0.5.3;

import '../../../../contracts/libraries/EpochLibrary.sol';

contract EpochLibraryTest{

    using EpochLibrary for EpochLibrary.EpochList;

    EpochLibrary.EpochList private epochList;

    uint256 maxBigNumberDoesNotFail;

    function beforeEach() public {
        maxBigNumberDoesNotFail = 115792089237316195423570985008687907853269984665640564039457584007913129639935 - block.number -1;
    }

    function testBigNumberShouldNotFail() public {
        require(
            epochList.create(keccak256(abi.encodePacked(block.number)),0, maxBigNumberDoesNotFail) == true,
            'Indicating BigNumber!'
        );
    }
}
