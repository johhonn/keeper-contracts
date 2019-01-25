pragma solidity 0.4.25;


/**
 * @title Parity Secret Store Interface
 * @author Ocean Protocol Team
 * @dev All function calls are currently implemented without side effects
 */
interface ISecretStore {
   /**
    *@notice checkPermissions is called by Parity secret store
    */
    function checkPermissions(
        address user,
        bytes32 documentKeyId
    )
    external view
    returns (bool permissionGranted);
}
