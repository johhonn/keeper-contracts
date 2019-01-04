pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

import './OceanToken.sol';

/**
@title Ocean Protocol Marketplace Contract
@author Team: Fang Gong, Samer Sallam, Ahmed Ali, Sebastian Gerske
*/

contract OceanMarket is Ownable {

    using SafeMath for uint256;
    using SafeMath for uint;

    // ============
    // DATA STRUCTURES:
    // ============

    // limit period for request of tokens
    mapping(address => uint256) private tokenRequest; // mapping from address to last time of request
    uint256 maxAmount = 10000 * 10 ** 18;             // max amount of tokens user can get for each request
    uint256 minPeriod = 0;                            // min amount of time to wait before request token again

    // marketplace global variables
    OceanToken public oceanToken;

    // ============
    // EVENTS:
    // ============
    event FrequentTokenRequest(
        address indexed requester,
        uint256 minPeriod
    );
    event LimitTokenRequest(
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
    * @dev OceanMarket Constructor
    * @param tokenAddress The deployed contract address of OceanToken
    * Runs only on initial contract creation.
    */
    constructor(
        address tokenAddress
    )
        public
    {
        require(
            tokenAddress != address(0x0),
            'Token address is 0x0.'
        );
        // instantiate Ocean token contract
        oceanToken = OceanToken(tokenAddress);
        // set the token receiver to be marketplace
        oceanToken.setReceiver(address(this));
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
        returns (bool)
    {
        /* solium-disable-next-line security/no-block-members */
        if (block.timestamp < tokenRequest[msg.sender] + minPeriod) {
            emit FrequentTokenRequest(
                msg.sender,
                minPeriod
            );
            return false;
        }
        // amount should not exceed maxAmount
        if (amount > maxAmount) {
            require(
                oceanToken.transfer(msg.sender, maxAmount),
                'Token transfer failed.'
            );
            emit LimitTokenRequest(
                msg.sender,
                amount,
                maxAmount
            );
        } else {
            require(
                oceanToken.transfer(msg.sender, amount),
                'Token transfer failed.'
            );
        }
        /* ethlint-next-line security/no-block-members */
        tokenRequest[msg.sender] = block.timestamp;
        return true;
    }

    /**
    * @dev Owner can limit the amount and time for token request in Testing
    * @param amount the max amount of tokens that can be requested
    * @param period the min amount of time before next request
    */
    function limitTokenRequest(
        uint amount,
        uint period
    )
        public
        onlyOwner()
    {
        // set min period of time before next request (in seconds)
        minPeriod = period;
        // set max amount for each request
        maxAmount = amount;
    }
}
