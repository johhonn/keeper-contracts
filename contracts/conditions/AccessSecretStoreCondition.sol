pragma solidity 0.5.3;

import './Condition.sol';
import '../agreements/AgreementStoreManager.sol';
import '../ISecretStore.sol';

contract AccessSecretStoreCondition is Condition, ISecretStore {

    mapping(bytes32 => mapping(address => bool)) private documentPermissions;

    AgreementStoreManager private agreementStoreManager;

    event Fulfilled(
        bytes32 indexed _agreementId,
        bytes32 indexed _documentId,
        address indexed _grantee,
        bytes32 _conditionId
    );

    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _agreementStoreManagerAddress
    )
        external
        initializer()
    {
        Ownable.initialize(_owner);
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
            msg.sender ==
            agreementStoreManager.getAgreementDIDOwner(_agreementId),
            'Invalid UpdateRole'
        );
        documentPermissions[_documentId][_grantee] = true;

        bytes32 _id = generateId(
            _agreementId,
            hashValues(_documentId, _grantee)
        );
        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );

        emit Fulfilled(
            _agreementId,
            _documentId,
            _grantee,
            _id
        );

        return state;
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
        external view
        returns(bool permissionGranted)
    {
        return documentPermissions[_documentId][_grantee];
    }
}

