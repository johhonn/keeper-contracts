pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

import './OceanToken.sol';

/**
@title Ocean Protocol Dispenser Contract
@author Team: Fang Gong, Samer Sallam, Ahmed Ali, Sebastian Gerske
*/

contract Dispenser is Ownable {

    using SafeMath for uint256;
    using SafeMath for uint;

    // ============
    // DATA STRUCTURES:
    // ============

    // limit period for request of tokens
    mapping(address => uint256) private tokenRequests; // mapping from address to last time of request
    uint256 private maxAmount;                         // max amount of tokens user can get for each request
    uint256 private minPeriod;                         // min amount of time to wait before request token again
    uint256 private scale;

    OceanToken public oceanToken;

    // ============
    // EVENTS:
    // ============
    // Request failed, to frequently
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

    // ============
    // modifier:
    // ============
    modifier validAddress(address sender) {
        require(
            sender != address(0x0),
            'Sender address is 0x0.'
        );
        _;
    }

    /**
    * @dev Dispenser Constructor
    * @param oceanTokenAddress The deployed contract address of an ERC20Detailed token
    * Runs only on initial contract creation.
    */
    constructor(
        address oceanTokenAddress
    ) 
        public
    {
        require(
            oceanTokenAddress != address(0x0),
            'Token address is 0x0.'
        );
        // instantiate OceanToken contract
        oceanToken = OceanToken(oceanTokenAddress);

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
        public validAddress(msg.sender)
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
