/* solium-disable */
pragma solidity 0.4.25;

import '../../SEA/PaymentConditions.sol';
import '../../SEA/ServiceExecutionAgreement.sol';
import 'zos-lib/contracts/Initializable.sol';


contract PaymentConditionsExtraFunctionality is PaymentConditions{
    //returns a number
    function getNumber() public pure returns(uint) {
        return 42;
    }
}
