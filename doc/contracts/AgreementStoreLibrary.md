
# library: AgreementStoreLibrary


## Structs

### public Agreement
Members:
* bytes32 did
* address templateId
* bytes32[] conditionIds
* address lastUpdatedBy
* uint256 blockNumberUpdated

### public AgreementList
Members:
* mapping(bytes32 => struct AgreementStoreLibrary.Agreement) agreements
* mapping(bytes32 => bytes32[]) didToAgreementIds
* mapping(address => bytes32[]) templateIdToAgreementIds
* bytes32[] agreementIds

## Functions

### internal create
Parameters:
* struct AgreementStoreLibrary.AgreementList _self
* bytes32 _id
* bytes32 _did
* address _templateId
* bytes32[] _conditionIds
