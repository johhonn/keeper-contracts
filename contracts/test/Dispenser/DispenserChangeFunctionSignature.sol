pragma solidity 0.5.3;

// Contain upgraded version of the contracts for test
import '../../Dispenser.sol';

contract DispenserChangeFunctionSignature is Dispenser {

    function requestTokens(
        uint256 amount,
        address caller
    )
        public
        returns (bool tokensTransferred)
    {
        require(
            msg.sender == caller,
            'Invalid caller address'
        );

        uint256 amountWithDigits = amount.mul(scale);

        require(
            amountWithDigits + totalMintAmount < maxMintAmount,
            'Exceeded maxMintAmount'
        );

        /* solium-disable-next-line security/no-block-members */
        if (block.timestamp < tokenRequests[msg.sender] + minPeriod) {
            // Failed, requested to frequently
            emit RequestFrequencyExceeded(
                msg.sender,
                minPeriod
            );
            return false;
        }

        // amount should not exceed maxAmount
        if (amountWithDigits > maxAmount) {
            // Failed, requested to much tokens
            emit RequestLimitExceeded(
                msg.sender,
                amount,
                maxAmount
            );
            return false;
        } else {
            require(
                oceanToken.mint(msg.sender, amountWithDigits),
                'Token minting failed.'
            );

            /* solium-disable-next-line security/no-block-members */
            tokenRequests[msg.sender] = block.timestamp;

            totalMintAmount.add(amountWithDigits);

            return true;
        }
    }
}

