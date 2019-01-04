pragma solidity 0.4.25;

/**
 * @title Parity Secret Store Interface
 * @author Ocean Protocol Team
 * @dev All function calls are currently implement without side effects
 */

interface ISecretStore {
    function checkPermissions(
        address user,
        bytes32 documentKeyId
    )
    external view
    returns (bool permissionGranted);
}
