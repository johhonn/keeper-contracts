pragma solidity 0.4.25;

import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

import '../token/OceanToken.sol';
import './ServiceAgreement.sol';

contract PaymentConditions {

    enum PaymentStatus { None, Locked, Released }

    struct Payment {
        address sender;
        address receiver;
        uint256 amount;
        PaymentStatus status;
    }

    ServiceAgreement private serviceAgreementStorage;
    StandardToken private token;
    uint256 private price;

    constructor(address _serviceAgreementAddress, address _tokenAddress, uint256 _price) public {
        require(_serviceAgreementAddress != address(0), 'invalid contract address');
        require(_tokenAddress != address(0), 'invalid token address');

        serviceAgreementStorage = ServiceAgreement(_serviceAgreementAddress);
        token = OceanToken(_tokenAddress);
        price = _price;
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

    function lockPayment(bytes32 serviceId) public returns (bool) {
        bool status = serviceAgreementStorage.getDependencyStatus(serviceId, this.lockPayment.selector);

        if (!status)
            return false;

        Payment storage payment = payments[serviceId];
        if (payment.status == PaymentStatus.Released)
            return false;

        if (payment.status == PaymentStatus.Locked)
            return true;

        address sender = msg.sender;
        address receiver = address(this);

        require(token.transferFrom(sender, receiver, price), 'payment failed');
        payments[serviceId] = Payment(sender, receiver, price, PaymentStatus.Locked);

        emit PaymentLocked(serviceId, payment.sender, payment.receiver, payment.amount);

        return serviceAgreementStorage.setConditionStatus(serviceId, this.lockPayment.selector);
    }

    function releasePayment(bytes32 serviceId) public returns (bool) {
        bool status = serviceAgreementStorage.getDependencyStatus(serviceId, this.releasePayment.selector);

        if (!status)
            return false;

        Payment storage payment = payments[serviceId];
        if (payment.status == PaymentStatus.None)
            return false;

        if (payment.status == PaymentStatus.Released)
            return true;

        require(token.transferFrom(payment.receiver, payment.sender, payment.amount), 'payment release failed');

        payments[serviceId].status = PaymentStatus.Released;
        emit PaymentReleased(serviceId, payment.sender, payment.receiver, payment.amount);

        serviceAgreementStorage.setConditionStatus(serviceId, this.releasePayment.selector);
        return true;
    }
}
