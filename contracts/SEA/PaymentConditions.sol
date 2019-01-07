pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import '../OceanToken.sol';
import './ServiceExecutionAgreement.sol';

/**
 * @title Payment Conditions
 * @author Ocean Protocol Team
 * @dev All function calls are currently implemented without side effects
 */


contract PaymentConditions {

    struct Payment {
        address sender;
        address receiver;
        uint256 amount;
    }

    ServiceExecutionAgreement private agreementStorage;
    ERC20 private token;

    constructor(
        address _agreementAddress,
        address _tokenAddress
    )
        public
    {
        require(
            _agreementAddress != address(0),
            'invalid contract address'
        );
        require(
            _tokenAddress != address(0),
            'invalid token address'
        );
        agreementStorage = ServiceExecutionAgreement(_agreementAddress);
        token = OceanToken(_tokenAddress);
    }

    mapping(bytes32 => Payment) private payments;

    event PaymentLocked(
        bytes32 indexed agreementId,
        address sender,
        address receiver,
        uint256 amount
    );
    event PaymentReleased(
        bytes32 indexed agreementId,
        address sender,
        address receiver,
        uint256 amount
    );
    event PaymentRefund(
        bytes32 indexed agreementId,
        address sender,
        address receiver,
        uint256 amount
    );

    /**
    * @notice lockPayment is called by asset consumer
    * @dev checks if this condition has unfulfilled dependencies otherwise it will fulfil the condition and lock the payment
    * @param agreementId is the SEA agreement ID
    * @param assetId refers to DID
    * @param price is the asset or service price in OCN tokens
    * @return true if asset consumer is able to lock payment into paymentCondition.sol contract
    */
    function lockPayment(
        bytes32 agreementId,
        bytes32 assetId,
        uint256 price
    )
        external
        returns (bool)
    {
        require(
            agreementStorage.getAgreementConsumer(agreementId) == msg.sender,
            'Only consumer can trigger lockPayment.'
        );
        bytes32 condition = agreementStorage.generateConditionKeyForId(
            agreementId,
            address(this),
            this.lockPayment.selector
        );

        if (agreementStorage.hasUnfulfilledDependencies(agreementId, condition))
            return false;

        if (agreementStorage.getConditionStatus(agreementId, condition) == 1)
            return true;

        bytes32 valueHash = hashValues(assetId, price);
        require(
            agreementStorage.fulfillCondition(
                agreementId,
                this.lockPayment.selector,
                valueHash
            ),
            'unable to not lock payment because token transfer failed'
        );

        token.allowance(msg.sender, address(this));
        require(
            token.transferFrom(msg.sender, address(this), price),
            'Can not lock payment');
        payments[agreementId] = Payment(msg.sender, address(this), price);
        emit PaymentLocked(
            agreementId,
            payments[agreementId].sender,
            payments[agreementId].receiver,
            payments[agreementId].amount
        );
    }

    /**
    * @notice releasePayment is called only by asset publisher
    * @dev it checks if this condition has unfulfilled dependencies otherwise it will fulfil the condition and release the payment
    * @param agreementId is the SEA agreement ID
    * @param assetId refers to DID
    * @param price is the asset or service price in OCN tokens
    * @return true if the publisher is able to release the payment
    */
    function releasePayment(
        bytes32 agreementId,
        bytes32 assetId,
        uint256 price
    )
        external
        returns (bool)
    {
        require(
            agreementStorage.getAgreementPublisher(agreementId) == msg.sender,
            'Only service agreement publisher can trigger releasePayment.'
        );

        bytes32 condition = agreementStorage.generateConditionKeyForId(
            agreementId,
            address(this),
            this.releasePayment.selector
        );

        if (agreementStorage.hasUnfulfilledDependencies(agreementId, condition))
            return false;

        if (agreementStorage.getConditionStatus(agreementId, condition) == 1)
            return true;

        bytes32 valueHash = hashValues(assetId, price);
        agreementStorage.fulfillCondition(
            agreementId,
            this.releasePayment.selector,
            valueHash
        );
        require(
            token.transfer(msg.sender, payments[agreementId].amount),
            'unable to release payment because token transfer failed'
        );
        emit PaymentReleased(
            agreementId,
            payments[agreementId].receiver,
            msg.sender,
            payments[agreementId].amount
        );
    }

    /**
    * @notice refundPayment is called by asset consumer
    * @dev it checks if this condition has unfulfilled dependencies otherwise it will fulfil the condition and make refund
    * @param agreementId is the SEA agreement ID
    * @param assetId refers to DID
    * @param price is the asset or service price in OCN tokens
    * @return true if the consumer is able to make refund
    */
    function refundPayment(
        bytes32 agreementId,
        bytes32 assetId,
        uint256 price
    )
        external
        returns (bool)
    {
        require(
            payments[agreementId].sender == msg.sender,
            'Only consumer can trigger refundPayment.'
        );

        bytes32 condition = agreementStorage.generateConditionKeyForId(
            agreementId,
            address(this),
            this.refundPayment.selector
        );
        if (agreementStorage.hasUnfulfilledDependencies(agreementId, condition))
            return false;

        if (agreementStorage.getConditionStatus(agreementId, condition) == 1)
            return true;

        bytes32 valueHash = hashValues(assetId, price);
        agreementStorage.fulfillCondition(
            agreementId,
            this.refundPayment.selector,
            valueHash
        );
        // transfer from this contract to consumer/msg.sender
        require(
            token.transfer(payments[agreementId].sender, payments[agreementId].amount),
            'unable to refund payment because token transfer failed'
        );
        emit PaymentRefund(
            agreementId,
            payments[agreementId].receiver,
            payments[agreementId].sender,
            payments[agreementId].amount
        );
        return true;
    }

   /**
    * @notice hashValues called by anyone and it produces hash of input values
    * @dev it hashes the price and assetID (DID) in order to generate unique hash that it is used for condition authorization
    * @param assetId refers to DID
    * @param price is the asset or service price in OCN tokens
    * @return hash of the input values
    */
    function hashValues(
        bytes32 assetId,
        uint256 price
    )
        public pure
        returns (
            bytes32 valueHash
        )
    {
        return keccak256(
            abi.encodePacked(
                assetId,
                price
            )
        );
    }
}
