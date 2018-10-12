pragma solidity ^0.4.25;

import 'ServiceAgreement.sol';


contract PaymentConditions{

    ServiceAgreement private serviceAgreementStorage;
    constructor(address _serviceAgreementAddress) public {
        require(_serviceAgreementAddress != address(0), 'invalid contract address');
        serviceAgreementStorage = ServiceAgreement(_serviceAgreementAddress);
    }

    event PaymentLocked(string _type, bytes32 serviceId, bytes32 condition, bytes32 payment);
    event PaymentReleased(string _type, bytes32 serviceId, bytes32 condition, bytes32 payment);


    function lockPayment(bytes32 serviceId, uint256 tokens, bytes32 assetId, bytes32 provider) public returns(bool) {
        bytes32 payment = 0;
        emit PaymentLocked("sla", serviceId, this.lockPayment.selector, payment);
        return true;
    }

    function releasePayment(bytes32 serviceId, bytes32 paymentId) public returns(bool) {
        emit PaymentReleased("sla", serviceId, this.releasePayment.selector, payment);
        return true;
    }
}
