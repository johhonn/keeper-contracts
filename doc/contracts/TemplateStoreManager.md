
# contract: TemplateStoreManager


## Variables

### internal templateList

## Modifiers

### internal onlyOwnerOrTemplateOwner
Parameters:
* address _id

## Functions

### public initialize
Parameters:
* address _owner

### external proposeTemplate
Parameters:
* address _id

### external approveTemplate
Parameters:
* address _id

### external revokeTemplate
Parameters:
* address _id

### external getTemplate
Parameters:
* address _id

### external getTemplateListSize

### external isTemplateApproved
Parameters:
* address _id
