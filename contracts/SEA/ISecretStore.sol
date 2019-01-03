pragma solidity 0.4.25;

interface ISecretStore {
    function checkPermissions(
        address user,
        bytes32 documentKeyId
    )
    external view
    returns (bool permissionGranted);
}
