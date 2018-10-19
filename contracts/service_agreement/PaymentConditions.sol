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

    event TestEvent(
        bool status,
        uint256 value
    );

    function lockPayment(bytes32 serviceId) public returns (bool) {
        bytes32 condition = serviceAgreementStorage.getConditionByFingerprint(serviceId, address(this), this.lockPayment.selector);
        bool allgood = !serviceAgreementStorage.hasUnfulfilledDependencies(serviceId, condition);
        if (!allgood)
            return;

        address sender = msg.sender;
        address receiver = address(this);
        require(serviceAgreementStorage.setConditionStatus(serviceId, this.lockPayment.selector), 'Cannot fulfill lockPayment condition');
        token.transferFrom(sender, receiver, price);
        payments[serviceId] = Payment(sender, receiver, price);
        emit PaymentLocked(serviceId, payments[serviceId].sender, payments[serviceId].receiver, payments[serviceId].amount);
    }

    function releasePayment(bytes32 serviceId) public returns (bool) {
        bool allgood = !serviceAgreementStorage.hasUnfulfilledDependencies(serviceId, this.releasePayment.selector);
        if (!allgood)
            return;

        require(serviceAgreementStorage.setConditionStatus(serviceId, this.releasePayment.selector), 'payment release failed');
        token.approve(address(this), payments[serviceId].amount);
        token.transferFrom(address(this), msg.sender, payments[serviceId].amount);
        emit PaymentReleased(serviceId, payments[serviceId].receiver, msg.sender, payments[serviceId].amount);
    }
}
