pragma solidity 0.5.3;

// Contain upgraded version of the contracts for test
import './DIDRegistryChangeFunctionSignature.sol';
import './DIDRegistryChangeInStorage.sol';

contract DIDRegistryChangeInStorageAndLogic is
    DIDRegistryChangeFunctionSignature,
    DIDRegistryChangeInStorage {
}
