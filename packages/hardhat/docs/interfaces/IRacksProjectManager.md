# Solidity API

## IRacksProjectManager

### newContributorRegistered

```solidity
event newContributorRegistered(address newContributor)
```

Event emitted when a new contributor is registered in RacksProjectManager

### newProjectCreated

```solidity
event newProjectCreated(string name, address newProjectAddress)
```

Event emitted when a new project is created in RacksProjectsManager

### isAdmin

```solidity
function isAdmin(address _account) external view returns (bool)
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

### getERC20Interface

```solidity
function getERC20Interface() external view returns (contract IERC20)
```

Get the address of the ERC20 used in RacksProjectsManger for colateral in projects

### getRacksPMOwner

```solidity
function getRacksPMOwner() external view returns (address)
```

Get the address of the owner of the contract

### isWalletContributor

```solidity
function isWalletContributor(address _account) external view returns (bool)
```

Returns true if @pram _account is registered as contributors otherwise return false

### isContributorBanned

```solidity
function isContributorBanned(address _account) external view returns (bool)
```

Returns true if @pram _account is banned otherwise return false

### getContributorData

```solidity
function getContributorData(address _account) external view returns (struct Contributor)
```

Returns all the data associated with @param _account contributor

### setAccountToContributorData

```solidity
function setAccountToContributorData(address _account, struct Contributor _newData) external
```

Update contributor data associated with @param _account contributor

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

