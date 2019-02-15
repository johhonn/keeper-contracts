pragma solidity 0.5.3;

import './Condition.sol';
import '../agreements/AgreementStoreManager.sol';
import '../ISecretStore.sol';

contract AccessSecretStoreCondition is Condition {

    mapping(bytes32 => mapping(address => bool)) private documentPermissions;

    AgreementStoreManager private agreementStoreManager;

    function initialize(
        address _conditionStoreManagerAddress,
        address _agreementStoreManagerAddress
    )
        public
        initializer()
    {
        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );
        agreementStoreManager = AgreementStoreManager(
            _agreementStoreManagerAddress
        );
    }

    function hashValues(
        bytes32 _documentId,
        address _grantee
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_documentId, _grantee));
    }

    function fulfill(
        bytes32 _agreementId,
        bytes32 _documentId,
        address _grantee
    )
        public
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            msg.sender == agreementStoreManager.getAgreementDidOwner(_agreementId),
            'Invalid UpdateRole'
        );
        documentPermissions[_documentId][_grantee] = true;
        return super.fulfill(
            generateId(_agreementId, hashValues(_documentId, _grantee)),
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }

    /**
    * @notice checkPermissions is called by Parity secret store
    * @param _documentId refers to the DID in which secret store will issue the decryption keys
    * @param _grantee is the address of the granted user
    * @return true if the access was granted
    */
    function checkPermissions(
        address _grantee,
        bytes32 _documentId
    )
        public view
        returns(bool permissionGranted)
    {
        return documentPermissions[_documentId][_grantee];
    }
}

