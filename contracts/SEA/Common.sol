pragma solidity 0.5.3;

import 'openzeppelin-eth/contracts/cryptography/ECDSA.sol';


/**
 * @title Common (Abstract Contract)
 * @author Ocean Protocol Team
 * @dev All function calls are currently implemented without side effects
 */
contract Common {

    /**
    * @notice utility function which is used to add the Ethereum prefix to the hash(message)
    * @param hash , hash(message)
    * @return prefixed Hash
    */
    function prefixHash(bytes32 hash)
        public pure
        returns (bytes32 prefixedHash)
    {
        return ECDSA.toEthSignedMessageHash(hash);
    }

    /**
    * @notice recoverAddress retrieves the address of the signer using the original message hash and the signature
    * @param hash is the hash of the original message
    * @param signature is an ECDSA based signature
    * @return signer address
    */
    function recoverAddress(
        bytes32 hash,
        bytes memory signature
    )
        public pure
        returns (
            address recoveredAddress
        )
    {
        require(
            signature.length == 65 && hash.length == 32,
            'invalid signature or hash size'
        );
        return ECDSA.recover(hash, signature);
    }
}
