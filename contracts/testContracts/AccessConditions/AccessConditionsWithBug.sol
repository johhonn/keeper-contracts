/* solium-disable */
pragma solidity 0.4.25;

import '../../SEA/AccessConditions.sol';
import '../../SEA/ServiceExecutionAgreement.sol';
import 'zos-lib/contracts/Initializable.sol';


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
