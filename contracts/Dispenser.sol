pragma solidity 0.4.25;

import 'openzeppelin-eth/contracts/math/SafeMath.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import 'zos-lib/contracts/Initializable.sol';
import './OceanToken.sol';


/**
 * @title Ocean Protocol Dispenser Contract
 * @author Ocean Protocol Team
 * @dev All function calls are currently implemented without side effects
 */
contract Dispenser is Initializable, Ownable {

    using SafeMath for uint256;
    using SafeMath for uint;

    // limit period for request of tokens
    // mapping from address to last time of request
    mapping(address => uint256) private tokenRequests;

    // max amount of tokens user can get for each request
    uint256 private maxAmount;
    
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

    modifier isValidAddress(address sender) {
        require(
            sender != address(0x0),
            'Sender address is 0x0.'
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
        public initializer()
    {
        require(
            _oceanTokenAddress != address(0x0),
            'Token address is 0x0.'
        );

        // instantiate OceanToken contract
        oceanToken = OceanToken(_oceanTokenAddress);
        Ownable.initialize(_owner);

        scale = 10 ** uint256(oceanToken.decimals());
        maxAmount = uint256(1000).mul(scale);
        minPeriod = 0;
    }

    /**
    * @dev user can request some tokens for testing
    * @param amount the amount of tokens to be requested
    * @return valid Boolean indication of tokens are requested
    */
    function requestTokens(
        uint256 amount
    )
        public isValidAddress(msg.sender)
        returns (bool tokensTransferred)
    {
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
        if (amount.mul(scale) > maxAmount) {
            // Failed, requested to much tokens
            emit RequestLimitExceeded(
                msg.sender,
                amount,
                maxAmount
            );
            return false;
        } else {
            require(
                oceanToken.mint(msg.sender, amount),
                'Token minting failed.'
            );

            /* solium-disable-next-line security/no-block-members */
            tokenRequests[msg.sender] = block.timestamp;

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
        onlyOwner()
    {
        // set min period of time before next request (in seconds)
        minPeriod = period;
    }

    /**
    * @dev the Owner can set the max amount for token requests
    * @param amount the max amount of tokens that can be requested
    */
    function setMaxAmount(
        uint amount
    )
        public
        onlyOwner()
    {
        // set max amount for each request
        maxAmount = amount.mul(scale);
    }
}
