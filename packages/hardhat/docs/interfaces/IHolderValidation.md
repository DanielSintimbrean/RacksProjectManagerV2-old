# Solidity API

## IHolderValidation

### newCollectionAdded

```solidity
event newCollectionAdded(contract IERC721 newCollection)
```

Event emitted when a new collection is authorized in RacksProjectManager

### isHolder

```solidity
function isHolder(address _account) external view returns (address)
```

Returns true if @param _account is admin in RacksProjectsManager otherwise returns false

