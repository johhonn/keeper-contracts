
# contract: TemplateStoreManager


## Variables

### private templateList

## Modifiers

### internal onlyOwnerOrTemplateOwner
Parameters:
* address _id

## Functions

### public initialize
Parameters:
* address _owner

### public proposeTemplate
Parameters:
* address _id

### public approveTemplate
Parameters:
* address _id

### public revokeTemplate
Parameters:
* address _id

### external getTemplate
Parameters:
* address _id

### public getTemplateListSize

### public isTemplateApproved
Parameters:
* address _id
