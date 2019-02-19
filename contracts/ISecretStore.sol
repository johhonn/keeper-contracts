pragma solidity 0.5.3;


/**
 * @title Parity Secret Store Interface
 * @author Ocean Protocol Team
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
