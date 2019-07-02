pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


/**
 * @title Whitelisting Condition Interface
 * @author Ocean Protocol Team
 */
interface IWhitelistCondition {

   /**
    * @notice 
    */
    function fulfill(
        bytes32 _agreementId,
        bytes32 addressHash
    )
    external view
    returns (bool exists);
}
