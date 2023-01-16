# Solidity API

## RacksProjectManager

### progressiveId

```solidity
uint256 progressiveId
```

### onlyAdmin

```solidity
modifier onlyAdmin()
```

Check that user is Admin

### onlyHolder

```solidity
modifier onlyHolder()
```

Check that user is Holder or Admin

### isNotPaused

```solidity
modifier isNotPaused()
```

Check that the smart contract is paused

### constructor

```solidity
constructor(contract IHolderValidation _holderValidation) public
```

### initialize

```solidity
function initialize(contract IERC20 _erc20) external
```

### createProject

```solidity
function createProject(string _name, uint256 _colateralCost, uint256 _reputationLevel, uint256 _maxContributorsNumber) external
```

Create Project

_Only callable by Admins_

### registerContributor

```solidity
function registerContributor() external
```

Add Contributor

_Only callable by Holders who are not already Contributors_

### addAdmin

```solidity
function addAdmin(address _newAdmin) external
```

Set new Admin

_Only callable by the Admin_

### removeAdmin

```solidity
function removeAdmin(address _account) external virtual
```

Remove an account from the user role

_Only callable by the Admin_

### setERC20Address

```solidity
function setERC20Address(address _erc20) external
```

Set new ERC20 Token

_Only callable by the Admin_

### setContributorStateToBanList

```solidity
function setContributorStateToBanList(address _account, bool _state) external
```

Set a ban state for a Contributor

_Only callable by Admins._

### setAccountToContributorData

```solidity
function setAccountToContributorData(address _account, struct Contributor _newData) public
```

Update contributor data associated with @param _account contributor

### increaseContributorRP

```solidity
function increaseContributorRP(address _account, uint256 grossReputationPoints) public
```

Increase Contributor's Reputation Level

### setIsPaused

```solidity
function setIsPaused(bool _newPausedValue) public
```

### isAdmin

```solidity
function isAdmin(address _account) public view returns (bool)
```

Returns true if @param _account is admin in RacksProjectsManager otherwise returns false.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _account | address | address of the account to check. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true if @param _account is admin in RacksProjectsManager otherwise returns false. |

### getHolderValidationInterface

```solidity
function getHolderValidationInterface() external view returns (contract IHolderValidation)
```

Returns Holder Validation contract address

### getERC20Interface

```solidity
function getERC20Interface() public view returns (contract IERC20)
```

Get the address of the ERC20 used in RacksProjectsManger for colateral in projects

### getRacksPMOwner

```solidity
function getRacksPMOwner() public view returns (address)
```

Get the address of the owner of the contract

### isContributorBanned

```solidity
function isContributorBanned(address _account) external view returns (bool)
```

Returns true if @pram _account is banned otherwise return false

### getProjects

```solidity
function getProjects() public view returns (contract Project[])
```

Get projects depending on Level

_Only callable by Holders_

### getContributor

```solidity
function getContributor(uint256 _index) public view returns (struct Contributor)
```

Get Contributor by index

### isWalletContributor

```solidity
function isWalletContributor(address _account) public view returns (bool)
```

Returns true if @pram _account is registered as contributors otherwise return false

### getContributorData

```solidity
function getContributorData(address _account) public view returns (struct Contributor)
```

Returns all the data associated with @param _account contributor

### getNumberOfContributors

```solidity
function getNumberOfContributors() external view returns (uint256)
```

Get total number of contributors

_Only callable by Holders_

### isPaused

```solidity
function isPaused() external view returns (bool)
```

Return true if the RacksProjectsManager is paused, otherwise false

### deleteProject

```solidity
function deleteProject() external
```

Deletes the project associated with the address of msg.sender Delete the project

_This function is called from Projects contracts when is deleted_

