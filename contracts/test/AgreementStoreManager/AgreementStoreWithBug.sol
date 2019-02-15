pragma solidity 0.5.3;

import '../../agreements/AgreementStoreManager.sol';

contract AgreementStoreWithBug is AgreementStoreManager {

    function getAgreementListSize()
        public
        view
        returns (uint size)
    {
        if (agreementList.agreementIds.length == 0)
            return agreementList.agreementIds.length;
        return 0;
    }
}
