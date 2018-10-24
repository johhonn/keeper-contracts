pragma solidity 0.4.25;

import 'truffle/Assert.sol';
import '../../contracts/token/OceanToken.sol';
import '../../contracts/service_agreement/PaymentConditions.sol';
import '../../contracts/service_agreement/ServiceAgreement.sol';

contract PaymentDependency {
    function fulfillLockPayment() public pure {}
    function fulfillReleasePayment() public pure {}
}

contract TestPaymentConditions {

    OceanToken token;
    uint256 balance;

    ServiceAgreement agreement;
    PaymentDependency dependency;
    PaymentConditions paymentConditions;
    uint256 price;

    function beforeAll() public {
        token = new OceanToken();
        token.setReceiver(msg.sender);
        balance = token.totalSupply();

        agreement = new ServiceAgreement();
        price = 10;
        dependency = new PaymentDependency();
        paymentConditions = new PaymentConditions(address(agreement), address(token), price);
    }

    function testRejectsToLockPaymentIfConditionsAreNotMet() public {
        bytes32 serviceId = 'payment-conditions-test-1';

        signAgreement(serviceId);

        Assert.equal(paymentConditions.lockPayment(serviceId), false, 'Payment was locked');
        Assert.equal(token.balanceOf(msg.sender), balance, 'The sender balance changed');
    }

    function testLocksPaymentIfConditionsAreMet() public {
        bytes32 serviceId = 'payment-conditions-test-2';

        signAgreement(serviceId);
        fulfillLockPaymentDependency(serviceId);

        Assert.equal(paymentConditions.lockPayment(serviceId), true, 'Payment was not locked');
        balance = balance - price;
        Assert.equal(token.balanceOf(msg.sender), balance, 'The sender balance did not change');
    }


    function testReturnsTrueUponSubsequentAttemptsToLock() public {
        bytes32 serviceId = 'payment-conditions-test-3';

        signAgreement(serviceId);
        fulfillLockPaymentDependency(serviceId);

        Assert.equal(paymentConditions.lockPayment(serviceId), true, 'Payment was not locked');
        balance = balance - price;
        Assert.equal(token.balanceOf(msg.sender), balance, 'The sender balance did not change');

        // Lock the same payment again, balance must stay.
        Assert.equal(paymentConditions.lockPayment(serviceId), true, 'Payment was not locked');
        Assert.equal(token.balanceOf(msg.sender), balance, 'The sender balance changed');
    }

    function testRejectsToReleasePaymentIfConditionsAreNotMet() public {
        bytes32 serviceId = 'payment-conditions-test-4';

        signAgreement(serviceId);

        Assert.equal(paymentConditions.releasePayment(serviceId), false, 'Payment was released');
        Assert.equal(token.balanceOf(msg.sender), balance, 'The sender balance changed');
    }

    function testReturnsFalseUponAttemptToReleasePaymentThatIsNotLocked() public {
        bytes32 serviceId = 'payment-conditions-test-5';

        signAgreement(serviceId);
        fulfillReleasePaymentDependency(serviceId);

        Assert.equal(paymentConditions.releasePayment(serviceId), false, 'Payment was released');
        Assert.equal(token.balanceOf(msg.sender), balance, 'The sender balance changed');
    }

    function testReleasesPaymentIfConditionsAreMet() public {
        bytes32 serviceId = 'payment-conditions-test-6';

        signAgreement(serviceId);
        fulfillReleasePaymentDependency(serviceId);

        paymentConditions.lockPayment(serviceId);
        balance = balance - price;

        Assert.equal(paymentConditions.releasePayment(serviceId), true, 'Payment was not released');
        balance = balance + price;
        Assert.equal(token.balanceOf(msg.sender), balance, 'The sender balance did not change');
    }

    function testReturnsTrueUponSubsequentAttemptsToRelease() public {
        bytes32 serviceId = 'payment-conditions-test-7';

        signAgreement(serviceId);
        fulfillReleasePaymentDependency(serviceId);

        paymentConditions.lockPayment(serviceId);
        balance = balance - price;

        Assert.equal(paymentConditions.releasePayment(serviceId), true, 'Payment was not released');
        balance = balance + price;
        Assert.equal(token.balanceOf(msg.sender), balance, 'The sender balance did not change');

        // Release the same payment again, balance must stay.
        Assert.equal(paymentConditions.releasePayment(serviceId), true, 'Payment was not released');
        Assert.equal(token.balanceOf(msg.sender), balance, 'The sender balance changed');
    }

    function signAgreement(bytes32 serviceId) private {
        address[] memory contracts = new address[](4);
        contracts[0] = address(dependency);
        contracts[1] = address(dependency);
        contracts[2] = address(paymentConditions);
        contracts[3] = address(paymentConditions);

        bytes4[] memory fingerprints = new bytes4[](4);
        fingerprints[0] = dependency.fulfillLockPayment.selector;
        fingerprints[1] = dependency.fulfillReleasePayment.selector;
        fingerprints[2] = paymentConditions.lockPayment.selector;
        fingerprints[3] = paymentConditions.releasePayment.selector;

        uint256[] memory dependencies = new uint256[](4);
        dependencies[0] = 0;
        dependencies[1] = 0;
        dependencies[2] = 1; // depends on fulfillLockPayment
        dependencies[3] = 2; // depends on fulfillReleasePayment

        agreement.setupAgreementTemplate(contracts, fingerprints, dependencies, serviceId);
    }

    function fulfillLockPaymentDependency(bytes32 serviceId) private {
        agreement.setConditionStatus(serviceId, dependency.fulfillLockPayment.selector);
    }

    function fulfillReleasePaymentDependency(bytes32 serviceId) private {
        agreement.setConditionStatus(serviceId, dependency.fulfillReleasePayment.selector);
    }
}
