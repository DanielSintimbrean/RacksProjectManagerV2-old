# Solidity API

## Project

### ProjectState

```solidity
enum ProjectState {
  Pending,
  Active,
  Finished,
  Deleted
}
```

### funders

```solidity
address[] funders
```

### isEditable

```solidity
modifier isEditable()
```

Check that the project has no contributors, therefore is editable

### isNotFinished

```solidity
modifier isNotFinished()
```

Check that the project is not finished

### onlyAdmin

```solidity
modifier onlyAdmin()
```

Check that user is Admin

### onlyContributor

```solidity
modifier onlyContributor()
```

Check that user is Contributor

### isNotPaused

```solidity
modifier isNotPaused()
```

Check that the smart contract is not Paused

### isNotPending

```solidity
modifier isNotPending()
```

Check that the smart contract is not Pending

### isNotDeleted

```solidity
modifier isNotDeleted()
```

Check that the smart contract is not Deleted

### newProjectContributorsRegistered

```solidity
event newProjectContributorsRegistered(address projectAddress, address newProjectContributor)
```

Events

### projectFunded

```solidity
event projectFunded(address projectAddress, address funderWallet, uint256 amount)
```

### constructor

```solidity
constructor(contract IRacksProjectManager _racksPM, string _name, uint256 _colateralCost, uint256 _reputationLevel, uint256 _maxContributorsNumber) public
```

### registerProjectContributor

```solidity
function registerProjectContributor() external
```

Add Project Contributor

_Only callable by Holders who are already Contributors_

### finishProject

```solidity
function finishProject(uint256 _totalReputationPointsReward, address[] _contributors, uint256[] _participationWeights) external
```

Finish Project

_Only callable by Admins when the project isn't completed
- The contributors and participationWeights array must have the same size of the project contributors list.
- If there is a banned Contributor in the project, you have to pass his address and participation (should be 0) anyways.
- The sum of @param _participationWeights can not be more than 100_

### fundProject

```solidity
function fundProject(uint256 _amount) external
```

Fund the project with ERC20

_This serves as a reward to contributors_

### giveAway

```solidity
function giveAway() external
```

Give Away extra rewards

_Only callable by Admins when the project is completed_

### supportsInterface

```solidity
function supportsInterface(bytes4 _interfaceId) public view virtual returns (bool)
```

Provides information about supported interfaces (required by AccessControl)

### deleteProject

```solidity
function deleteProject() public
```

### removeContributor

```solidity
function removeContributor(address _contributor, bool _returnColateral) public
```

### approveProject

```solidity
function approveProject() external
```

the Project State

_Only callable by Admins when the project has no Contributor yet and is pending._

### setName

```solidity
function setName(string _name) external
```

the Project Name

_Only callable by Admins when the project has no Contributor yet._

### setColateralCost

```solidity
function setColateralCost(uint256 _colateralCost) external
```

Edit the Colateral Cost

_Only callable by Admins when the project has no Contributor yet._

### setReputationLevel

```solidity
function setReputationLevel(uint256 _reputationLevel) external
```

Edit the Reputation Level

_Only callable by Admins when the project has no Contributor yet._

### setMaxContributorsNumber

```solidity
function setMaxContributorsNumber(uint256 _maxContributorsNumber) external
```

Edit the Reputation Level

_Only callable by Admins when the project has no Contributor yet._

### getName

```solidity
function getName() external view returns (string)
```

Get the project name

### getColateralCost

```solidity
function getColateralCost() external view returns (uint256)
```

Get the colateral cost to enter as contributor

### getReputationLevel

```solidity
function getReputationLevel() external view returns (uint256)
```

Get the reputation level of the project

### getMaxContributors

```solidity
function getMaxContributors() external view returns (uint256)
```

Get the maximum contributor that can be in the project

### getNumberOfContributors

```solidity
function getNumberOfContributors() external view returns (uint256)
```

Get total number of contributors

### getAllContributorsAddress

```solidity
function getAllContributorsAddress() external view returns (address[])
```

Get all contributor addresses

### getContributorByAddress

```solidity
function getContributorByAddress(address _account) external view returns (struct Contributor)
```

Get contributor by address

### isContributorInProject

```solidity
function isContributorInProject(address _contributor) public view returns (bool)
```

Return true if the address is a contributor in the project

### getContributorParticipation

```solidity
function getContributorParticipation(address _contributor) external view returns (uint256)
```

Get the participation weight in percent

### getAccountFunds

```solidity
function getAccountFunds(address _account) external view returns (uint256)
```

Get the balance of funds given by an address

### getTotalAmountFunded

```solidity
function getTotalAmountFunded() external view returns (uint256)
```

Get total amount of funds a Project got since creation

### isPending

```solidity
function isPending() external view returns (bool)
```

Returns whether the project is pending or not

### isActive

```solidity
function isActive() external view returns (bool)
```

Returns whether the project is active or not

### isFinished

```solidity
function isFinished() external view returns (bool)
```

Return true is the project is completed, otherwise return false

### isDeleted

```solidity
function isDeleted() external view returns (bool)
```

Returns whether the project is deleted or not

