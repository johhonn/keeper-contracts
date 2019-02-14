pragma solidity 0.5.3;

// Contain upgraded version of the contracts for test
import 'openzeppelin-eth/contracts/math/SafeMath.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import 'zos-lib/contracts/Initializable.sol';
import '../../OceanToken.sol';

contract DispenserChangeInStorageAndLogic is Initializable, Ownable {

    // New variables should be added after the last variable
    // Old variables should be kept even if unused
    // No base contracts swap
    // https://github.com/jackandtheblockstalk/upgradeable-proxy#331-you-can-1

    using SafeMath for uint256;
    using SafeMath for uint;

    // limit period for request of tokens
    // mapping from address to last time of request
    mapping(address => uint256) private tokenRequests;
    uint256 private totalMintAmount;

    // max amount of tokens user can get for each request
    uint256 private maxAmount;

    // max amount of tokens that can be minted using this dispenser in total
    uint256 private maxMintAmount;

     // min amount of time to wait before request token again
    uint256 private minPeriod;
    uint256 private scale;

    OceanToken public oceanToken;

    event RequestFrequencyExceeded(
        address indexed requester,
        uint256 minPeriod
    );

    // Request amount limit exceeded
    event RequestLimitExceeded(
        address indexed requester,
        uint256 amount,
        uint256 maxAmount
    );

    modifier isValidAddress(address _address) {
        require(
            _address != address(0x0),
            'isValidAddress failed, Address is 0x0.'
        );
        _;
    }

    /**
     * @dev Dispenser Initializer
     * @param _oceanTokenAddress The deployed contract address of an OceanToken
     * @param _owner The owner of the Dispenser
     * Runs only on initial contract creation.
     */
    function initialize(
        address _oceanTokenAddress,
        address _owner
    )
        public
        initializer
        isValidAddress(_oceanTokenAddress)
    {
        Ownable.initialize(_owner);

        // instantiate OceanToken contract
        oceanToken = OceanToken(_oceanTokenAddress);

        scale = 10 ** uint256(oceanToken.decimals());
        maxAmount = uint256(1000).mul(scale);
        minPeriod = 0;

        maxMintAmount = uint256(100000000).mul(scale);
    }

    /**
     * @dev user can request some tokens for testing
     * @param amount the amount of tokens to be requested
     * @return valid Boolean indication of tokens are requested
     */
    function requestTokens(
        uint256 amount,
        address caller
    )
        public
        isValidAddress(msg.sender)
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

    /**
     * @dev the Owner can set the min period for token requests
     * @param period the min amount of time before next request
     */
    function setMinPeriod(
        uint period
    )
        public
        onlyOwner
    {
        // set min period of time before next request (in seconds)
        minPeriod = period;
    }

    /**
     * @dev the Owner can set the max amount for token requests
     * @param amount the max amount of tokens that can be requested
     */
    function setMaxAmount(
        uint256 amount
    )
        public
        onlyOwner
    {
        // set max amount for each request
        maxAmount = amount.mul(scale);
    }

    /**
     * @dev the Owner can set the max amount for token requests
     * @param amount the max amount of tokens that can be requested
     */
    function setMaxMintAmount(
        uint amount
    )
        public
        onlyOwner
    {
        // set max amount for each request
        maxMintAmount = amount.mul(scale);
    }

    // adding dummy state variable
    uint256 public totalUnMintedAmount;
}
