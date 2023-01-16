# Solidity API

## HolderValidation

### progressiveId

```solidity
uint256 progressiveId
```

State variables

### constructor

```solidity
constructor(contract IERC721 _erc721) public
```

### isHolder

```solidity
function isHolder(address _wallet) external view returns (address)
```

Get whether a wallet is holder of at least one authorized collection

### addCollection

```solidity
function addCollection(contract IERC721 _newCollection) public
```

Add ERC721 Collection

_Only callable by Admins_

### deleteCollection

```solidity
function deleteCollection(address _deleteCollection) external
```

Delete ERC721 Collection

_Only callable by Admins_

### getAllCollections

```solidity
function getAllCollections() external view returns (contract IERC721[])
```

Get all authorized collections
