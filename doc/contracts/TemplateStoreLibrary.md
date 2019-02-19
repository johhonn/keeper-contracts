
# library: TemplateStoreLibrary


## Structs

### public Template
Members:
* enum TemplateStoreLibrary.TemplateState state
* address owner
* address lastUpdatedBy
* uint256 blockNumberUpdated

### public TemplateList
Members:
* mapping(address => struct TemplateStoreLibrary.Template) templates
* address[] templateIds

## Functions

### internal propose
Parameters:
* struct TemplateStoreLibrary.TemplateList _self
* address _id

### internal approve
Parameters:
* struct TemplateStoreLibrary.TemplateList _self
* address _id

### internal revoke
Parameters:
* struct TemplateStoreLibrary.TemplateList _self
* address _id
