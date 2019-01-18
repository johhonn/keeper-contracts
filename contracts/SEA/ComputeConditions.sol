pragma solidity 0.4.25;

import './Common.sol';
import './ServiceExecutionAgreement.sol';
import 'zos-lib/contracts/Initializable.sol';


/**
 * @title On-premise compute conditions
 * @author Ocean Protocol Team
 * @notice This contract is WIP, don't use it for production
 */
contract ComputeConditions is Common, Initializable {

    struct ProofOfUpload {
        bool exists;
        bool isValid;
        bool isLocked;
        address dataConsumer;
        bytes32 algorithmHash;
        bytes algorithmHashSignature;
    }

    ServiceExecutionAgreement private agreementStorage;

    mapping (bytes32 => ProofOfUpload) proofs;

    //events
    event HashSignatureSubmitted(
        bytes32 indexed agreementId,
        address indexed consumer,
        address indexed publisher,
        bool state
    );
    event HashSubmitted(
        bytes32 indexed agreementId,
        address indexed consumer,
        address indexed publisher,
        bool state
    );
    event ProofOfUploadValid(
        bytes32 indexed agreementId,
        address indexed consumer,
        address indexed publisher
    );
    event ProofOfUploadInvalid(
        bytes32 indexed agreementId,
        address indexed consumer,
        address indexed publisher
    );

    modifier onlyDataConsumer(bytes32 agreementId) {
        require(
            msg.sender == agreementStorage.getAgreementConsumer(agreementId),
            'Invalid data consumer address!'
        );
        _;
    }

    modifier onlyComputePublisher(bytes32 agreementId) {
        require(
            msg.sender == agreementStorage.getAgreementPublisher(agreementId),
            'Invalid publisher address');
        _;

    }

    modifier onlyStakeholders(bytes32 agreementId) {
        require(
            msg.sender == agreementStorage.getAgreementPublisher(agreementId) ||
            msg.sender == agreementStorage.getAgreementConsumer(agreementId),
            'Access denied');
        require(
            !proofs[agreementId].isValid,
            'avoid replay attack'
        );
        _;
    }

    function initialize(
        address agreementAddress
    )
        public initializer()
    {
        require(
            agreementAddress != address(0),
            'invalid service agreement contract address'
        );
        agreementStorage = ServiceExecutionAgreement(agreementAddress);
    }

   /**
    * @notice submitHashSignature is called only by the data-consumer address.
    * @dev At first It checks if the proof state is created or not then checks that the hash
    * has been submitted by the publisher. This preserves the message integrity
    * it also proof that both parties agree on the same algorithm file(s)
    * @param agreementId is the service level agreement Id
    * @param signature data scientist signature = signed_hash(uploaded_algorithm_file/s)
    */
    function submitHashSignature(
        bytes32 agreementId,
        bytes signature
    )
        external
        onlyDataConsumer(agreementId)
        returns(bool status)
    {
        if (proofs[agreementId].exists) {
            require(
                !proofs[agreementId].isLocked,
                'avoid race conditions'
            );
            proofs[agreementId].isLocked = true;
            proofs[agreementId].algorithmHashSignature = signature;
            fulfillUpload(agreementId, true);
        } else {
            proofs[agreementId] = ProofOfUpload(
                true,
                false,
                true,
                agreementStorage.getAgreementConsumer(agreementId),
                bytes32(0),
                signature
            );
        }
        emit HashSignatureSubmitted(
            agreementId,
            agreementStorage.getAgreementConsumer(agreementId),
            agreementStorage.getAgreementPublisher(agreementId),
            true
        );
        proofs[agreementId].isLocked = false;
        return true;

    }

   /**
    * @notice submitAlgorithmHash is called only by the compute publisher.
    * @dev At first It checks if the proof state is created or not then checks if the signature
    * has been submitted by the data scientist in order to call fulfillUpload. This preserves
    * the message integrity and proof that both parties agree on the same algorithm file/s
    * @param agreementId the service level agreement Id
    * @param hash = kekccak(uploaded_algorithm_file/s)
    * @return true if the compute publisher is able to send the right algorithm hash
    */
    function submitAlgorithmHash(
        bytes32 agreementId,
        bytes32 hash
    )
        external
        onlyComputePublisher(agreementId)
        returns(bool)
    {
        if (proofs[agreementId].exists) {
            require(
                !proofs[agreementId].isLocked,
                'avoid race conditions'
            );
            proofs[agreementId].isLocked = true;
            proofs[agreementId].algorithmHash = hash;
            fulfillUpload(agreementId, true);
        } else {
            proofs[agreementId] = ProofOfUpload(
                true,
                false,
                true,
                agreementStorage.getAgreementConsumer(agreementId),
                hash,
                new bytes(0)
            );
        }
        emit HashSubmitted(
            agreementId,
            agreementStorage.getAgreementConsumer(agreementId),
            agreementStorage.getAgreementPublisher(agreementId),
            true
        );
        proofs[agreementId].isLocked = false;
        return true;
    }

   /**
    * @notice fulfillUpload is called by anyone of the stakeholders [compute publisher or compute consumer]
    * @dev check if there are unfulfilled dependency condition, if false, it verifies the signature
    * using the submitted hash (by publisher), the signature (by data scientist/consumer) then call
    * fulfillCondition in service level agreement storage contract
    * @param agreementId the service level agreement Id
    * @param state get be used fo input value hash for this condition indicating the state of verification
    */
    function fulfillUpload(
        bytes32 agreementId,
        bool state
    )
        public
        onlyStakeholders(agreementId)
        returns(bool status)
    {
        bytes32 condition = agreementStorage.generateConditionKeyForId(
            agreementId,
            address(this),
            this.fulfillUpload.selector
        );
        require(
            !agreementStorage.hasUnfulfilledDependencies(
                agreementId,
                condition
            ),
            'condition has unfulfilled dependencies'
        );

        if (
            proofs[agreementId].dataConsumer == recoverAddress(
                prefixHash(proofs[agreementId].algorithmHash),
                proofs[agreementId].algorithmHashSignature)
        )
        {
            agreementStorage.fulfillCondition(
                agreementId,
                    this.fulfillUpload.selector,
                    keccak256(abi.encodePacked(state))
            );
            emit ProofOfUploadValid(
                agreementId,
                agreementStorage.getAgreementConsumer(agreementId),
                agreementStorage.getAgreementPublisher(agreementId)
            );
            proofs[agreementId].isValid = true;
            return true;
        }
        emit ProofOfUploadInvalid(
            agreementId,
            agreementStorage.getAgreementConsumer(agreementId),
            agreementStorage.getAgreementPublisher(agreementId)
        );
        return false;
    }
}
