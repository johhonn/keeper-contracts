/* solium-disable */
pragma solidity 0.4.25;

import '../SEA/AccessConditions.sol';
import '../SEA/ServiceExecutionAgreement.sol';
import 'zos-lib/contracts/Initializable.sol';


contract AccessConditionsExtraFunctionality is AccessConditions{
    //returns a number
    function getNumber()
        public pure
        returns(uint)
    {
        return 42;
    }
}

contract AccessConditionsChangeInStorage is AccessConditions{
    // keep track of how many times a function was called.
    mapping (address=>uint256) public called;
}

contract AccessConditionsChangeInStorageAndLogic is Initializable{

    mapping(bytes32 => mapping(address => bool)) private assetPermissions;

    ServiceExecutionAgreement private serviceAgreementStorage;
    event AccessGranted(bytes32 serviceId, bytes32 asset);
    mapping (address=>uint256) public called;

    modifier onlySLAPublisher(bytes32 serviceId, address publisher) {
        require(
            serviceAgreementStorage.getAgreementPublisher(serviceId) == publisher,
            'Restricted access - only SLA publisher'
        );
        _;
    }

    function initialize(address _serviceAgreementAddress) public initializer() {
        require(
            _serviceAgreementAddress != address(0),
            'invalid contract address'
        );
        serviceAgreementStorage = ServiceExecutionAgreement(_serviceAgreementAddress);
    }

    function checkPermissions(
        address consumer,
        bytes32 documentKeyId
    )
        public view
        returns(bool)
    {
        return assetPermissions[documentKeyId][consumer];
    }

    function grantAccess(
        bytes32 serviceId,
        bytes32 assetId,
        bytes32 documentKeyId
    )
        public onlySLAPublisher(serviceId, msg.sender)
        returns (bool)
    {
        called[msg.sender] += 1;
        bytes32 condition = serviceAgreementStorage.generateConditionKey(
            serviceId,
            address(this),
            this.grantAccess.selector
        );
        bool allgood = !serviceAgreementStorage.hasUnfulfilledDependencies(serviceId, condition);
        if (!allgood)
            return;

        bytes32 valueHash = keccak256(abi.encodePacked(assetId, documentKeyId));
        require(
            serviceAgreementStorage.fulfillCondition(
                serviceId,
                this.grantAccess.selector,
                valueHash
            ),
            'Cannot fulfill grantAccess condition'
        );
        address consumer = serviceAgreementStorage.getAgreementConsumer(serviceId);
        assetPermissions[documentKeyId][consumer] = true;
        emit AccessGranted(serviceId, assetId);
    }
}

contract AccessConditionsWithBug is Initializable{

    mapping(bytes32 => mapping(address => bool)) private assetPermissions;

    ServiceExecutionAgreement private serviceAgreementStorage;
    event AccessGranted(bytes32 serviceId, bytes32 asset);

    modifier onlySLAPublisher(
        bytes32 serviceId,
        address publisher
    )
    {
        require(
            serviceAgreementStorage.getAgreementPublisher(serviceId) == publisher,
            'Restricted access - only SLA publisher'
        );
        _;
    }

    function initialize(
        address _serviceAgreementAddress
    )
        public initializer()
    {
        require(
            _serviceAgreementAddress != address(0),
            'invalid contract address'
        );
        serviceAgreementStorage = ServiceExecutionAgreement(_serviceAgreementAddress);
    }

    function checkPermissions(
        address consumer,
        bytes32 documentKeyId
    )
        public view
        returns(bool)
    {
        return assetPermissions[documentKeyId][consumer];
    }

    function grantAccess(
        bytes32 serviceId,
        bytes32 assetId,
        bytes32 documentKeyId
    )
        public
        returns (bool)
    {
        assetPermissions[documentKeyId][msg.sender] = true;
        emit AccessGranted(serviceId, assetId);
    }
}


contract AccessConditionsChangeFunctionSignature is Initializable {

    mapping(bytes32 => mapping(address => bool)) private assetPermissions;

    ServiceExecutionAgreement private serviceAgreementStorage;
    event AccessGranted(bytes32 serviceId, bytes32 asset);

    modifier onlySLAPublisher(bytes32 serviceId, address publisher) {
        require(
            serviceAgreementStorage.getAgreementPublisher(serviceId) == publisher,
            'Restricted access - only SLA publisher'
        );
        _;
    }

    function initialize(
        address _serviceAgreementAddress
    )
        public initializer()
    {
        require(_serviceAgreementAddress != address(0), 'invalid contract address');
        serviceAgreementStorage = ServiceExecutionAgreement(_serviceAgreementAddress);
    }

    function checkPermissions(address consumer, bytes32 documentKeyId)
        public view
        returns(bool)
    {
        return assetPermissions[documentKeyId][consumer];
    }

    function grantAccess(
        bytes32 serviceId,
        bytes32 assetId,
        bytes32 documentKeyId,
        address requester
    )
        public onlySLAPublisher(serviceId, requester)
        returns (bool)
    {
        bytes32 condition = serviceAgreementStorage.generateConditionKey(
            serviceId,
            address(this),
            this.grantAccess.selector
        );
        bool allgood = !serviceAgreementStorage.hasUnfulfilledDependencies(serviceId, condition);
        if (!allgood)
            return;

        // bytes32 valueHash = keccak256(abi.encodePacked(assetId, documentKeyId));
        // require(
        //     serviceAgreementStorage.fulfillCondition(serviceId, this.grantAccess.selector, valueHash),
        //     'Cannot fulfill grantAccess condition'
        // );
        address consumer = serviceAgreementStorage.getAgreementConsumer(serviceId);
        assetPermissions[documentKeyId][consumer] = true;
        emit AccessGranted(serviceId, assetId);
    }
}
