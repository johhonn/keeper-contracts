pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import '../token/OceanToken.sol';
import './ServiceAgreement.sol';

/// @title Payment Conditions Contract
/// @author Ocean Protocol Team
/// @dev All function calls are currently implement without side effects

contract PaymentConditions {

    struct Payment {
        address sender;
        address receiver;
        uint256 amount;
    }

    ServiceAgreement private serviceAgreementStorage;
    ERC20 private token;

    constructor(address _serviceAgreementAddress, address _tokenAddress) public {
        require(_serviceAgreementAddress != address(0), 'invalid contract address');
        require(_tokenAddress != address(0), 'invalid token address');
        serviceAgreementStorage = ServiceAgreement(_serviceAgreementAddress);
        token = OceanToken(_tokenAddress);
    }

    mapping(bytes32 => Payment) private payments;

    event PaymentLocked(
        bytes32 indexed serviceId,
        address sender,
        address receiver,
        uint256 amount
    );
    event PaymentReleased(
        bytes32 indexed serviceId,
        address sender,
        address receiver,
        uint256 amount
    );
    event PaymentRefund(
        bytes32 indexed serviceId,
        address sender,
        address receiver,
        uint256 amount
    );

    /// @notice lockPayment is called by consumer.
    /// @dev mainly it is part of escrow payment (a condition fulfillment function)
    /// @param serviceId , service agreement instance ID
    /// @param assetId , published or registered asset DID
    /// @param price , asset price in OCN token
    /// @return true if the payment get locked to the payment contract
    function lockPayment(bytes32 serviceId, bytes32 assetId, uint256 price) public returns (bool) {
        require(serviceAgreementStorage.getAgreementConsumer(serviceId) == msg.sender, 'Only consumer can trigger lockPayment.');
        bytes32 condition = serviceAgreementStorage.getConditionByFingerprint(serviceId, address(this), this.lockPayment.selector);

        if (serviceAgreementStorage.hasUnfulfilledDependencies(serviceId, condition))
            return false;

        if (serviceAgreementStorage.getConditionStatus(serviceId, condition) == 1)
            return true;

        bytes32 valueHash = keccak256(abi.encodePacked(assetId, price));
        require(serviceAgreementStorage.fulfillCondition(serviceId, this.lockPayment.selector, valueHash), 'unable to not lock payment because token transfer failed');
        require(token.transferFrom(msg.sender, address(this), price), 'Can not lock payment');
        payments[serviceId] = Payment(msg.sender, address(this), price);
        emit PaymentLocked(serviceId, payments[serviceId].sender, payments[serviceId].receiver, payments[serviceId].amount);
    }

    /// @notice releasePayment is called by anyone but mainly asset publisher.
    /// @dev usually payment is released once the service agreement is fulfilled.
    /// @param serviceId , service agreement instance ID
    /// @param assetId , published or registered asset DID
    /// @param price , asset price in OCN token
    /// @return true if the publisher is able to release and receive the locked payment
    function releasePayment(bytes32 serviceId, bytes32 assetId, uint256 price) public returns (bool) {
        require(serviceAgreementStorage.getAgreementPublisher(serviceId) == msg.sender, 'Only service agreement publisher can trigger releasePayment.');
        bytes32 condition = serviceAgreementStorage.getConditionByFingerprint(serviceId, address(this), this.releasePayment.selector);
        if (serviceAgreementStorage.hasUnfulfilledDependencies(serviceId, condition))
            return false;

        if (serviceAgreementStorage.getConditionStatus(serviceId, condition) == 1)
            return true;

        bytes32 valueHash = keccak256(abi.encodePacked(assetId, price));
        serviceAgreementStorage.fulfillCondition(serviceId, this.releasePayment.selector, valueHash);
        require(token.transfer(msg.sender, payments[serviceId].amount), 'unable to release payment because token transfer failed');
        emit PaymentReleased(serviceId, payments[serviceId].receiver, msg.sender, payments[serviceId].amount);
    }

    /// @notice releasePayment is called by consumer.
    /// @dev consumers are able to make refund in case of the service agreement is not fulfilled
    /// @param serviceId , service agreement instance ID
    /// @param assetId , published or registered asset DID
    /// @param price , asset price in OCN token
    /// @return true if the consumer is able to make refund
    function refundPayment(bytes32 serviceId, bytes32 assetId, uint256 price) public returns (bool) {
        require(payments[serviceId].sender == msg.sender, 'Only consumer can trigger refundPayment.');
        bytes32 condition = serviceAgreementStorage.getConditionByFingerprint(serviceId, address(this), this.refundPayment.selector);
        if (serviceAgreementStorage.hasUnfulfilledDependencies(serviceId, condition))
            return false;

        if (serviceAgreementStorage.getConditionStatus(serviceId, condition) == 1)
            return true;

        bytes32 valueHash = keccak256(abi.encodePacked(assetId, price));
        serviceAgreementStorage.fulfillCondition(serviceId, this.refundPayment.selector, valueHash);
        // transfer from this contract to consumer/msg.sender
        require(token.transfer(payments[serviceId].sender, payments[serviceId].amount), 'unable to refund payment because token transfer failed');
        emit PaymentRefund(serviceId, payments[serviceId].receiver, payments[serviceId].sender, payments[serviceId].amount);
    }
}
