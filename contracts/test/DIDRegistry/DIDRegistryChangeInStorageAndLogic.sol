pragma solidity 0.5.6;

// Contain upgraded version of the contracts for test
import './DIDRegistryChangeFunctionSignature.sol';
import './DIDRegistryChangeInStorage.sol';


/* solium-disable-next-line no-empty-blocks */
contract DIDRegistryChangeInStorageAndLogic is
    DIDRegistryChangeFunctionSignature,
    DIDRegistryChangeInStorage {
}
