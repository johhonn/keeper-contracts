pragma solidity ^0.4.25;

import 'browser/ServiceAgreement.sol';


contract PaymentConditions{

    ServiceAgreement private serviceAgreementStorage;
    constructor(address _serviceAgreementAddress) public {
        require(_serviceAgreementAddress != address(0), 'invalid contract address');
        serviceAgreementStorage = ServiceAgreement(_serviceAgreementAddress);
    }


    function updateState(bytes32 serviceId, bytes32 funcFingerPrint, string eventId) private returns (bool);

    function lockPayment(bytes32 serviceId, uint256 tokens, bytes32 assetId, bytes32 provider) public returns(bool);

    function releasePayment(bytes32 serviceId, bytes32 paymentId) public returns(bool);
}
