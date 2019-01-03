pragma solidity 0.4.25;

interface ISecretStore {
    function checkPermissions(
        address user, bytes32 document
    )
    external view
    returns (bool permissionGranted);
}
