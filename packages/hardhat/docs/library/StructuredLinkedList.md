# Solidity API

## StructuredLinkedList

_An utility library for using sorted linked list data structures in your Solidity project._

### List

```solidity
struct List {
  uint256 size;
  mapping(uint256 => mapping(bool => uint256)) list;
}
```

### nodeExists

```solidity
function nodeExists(struct StructuredLinkedList.List self, uint256 _node) internal view returns (bool)
```

_Checks if the node exists_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct StructuredLinkedList.List | stored linked list from contract |
| _node | uint256 | a node to search for |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool true if node exists, false otherwise |

### sizeOf

```solidity
function sizeOf(struct StructuredLinkedList.List self) internal view returns (uint256)
```

_Returns the number of elements in the list_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct StructuredLinkedList.List | stored linked list from contract |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 |

### getAdjacent

```solidity
function getAdjacent(struct StructuredLinkedList.List self, uint256 _node, bool _direction) internal view returns (bool, uint256)
```

_Returns the link of a node `_node` in direction `_direction`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct StructuredLinkedList.List | stored linked list from contract |
| _node | uint256 | id of the node to step from |
| _direction | bool | direction to step in |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool, uint256 true if node exists or false otherwise, node in _direction |
| [1] | uint256 |  |

### getNextNode

```solidity
function getNextNode(struct StructuredLinkedList.List self, uint256 _node) internal view returns (bool, uint256)
```

_Returns the link of a node `_node` in direction `_NEXT`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct StructuredLinkedList.List | stored linked list from contract |
| _node | uint256 | id of the node to step from |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool, uint256 true if node exists or false otherwise, next node |
| [1] | uint256 |  |

### getPreviousNode

```solidity
function getPreviousNode(struct StructuredLinkedList.List self, uint256 _node) internal view returns (bool, uint256)
```

_Returns the link of a node `_node` in direction `_PREV`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct StructuredLinkedList.List | stored linked list from contract |
| _node | uint256 | id of the node to step from |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool, uint256 true if node exists or false otherwise, previous node |
| [1] | uint256 |  |

### insertAfter

```solidity
function insertAfter(struct StructuredLinkedList.List self, uint256 _node, uint256 _new) internal returns (bool)
```

_Insert node `_new` beside existing node `_node` in direction `_NEXT`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct StructuredLinkedList.List | stored linked list from contract |
| _node | uint256 | existing node |
| _new | uint256 | new node to insert |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool true if success, false otherwise |

### insertBefore

```solidity
function insertBefore(struct StructuredLinkedList.List self, uint256 _node, uint256 _new) internal returns (bool)
```

_Insert node `_new` beside existing node `_node` in direction `_PREV`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct StructuredLinkedList.List | stored linked list from contract |
| _node | uint256 | existing node |
| _new | uint256 | new node to insert |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool true if success, false otherwise |

### remove

```solidity
function remove(struct StructuredLinkedList.List self, uint256 _node) internal returns (uint256)
```

_Removes an entry from the linked list_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct StructuredLinkedList.List | stored linked list from contract |
| _node | uint256 | node to remove from the list |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 the removed node |

### pushFront

```solidity
function pushFront(struct StructuredLinkedList.List self, uint256 _node) internal returns (bool)
```

_Pushes an entry to the head of the linked list_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct StructuredLinkedList.List | stored linked list from contract |
| _node | uint256 | new entry to push to the head |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool true if success, false otherwise |

### pushBack

```solidity
function pushBack(struct StructuredLinkedList.List self, uint256 _node) internal returns (bool)
```

_Pushes an entry to the tail of the linked list_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct StructuredLinkedList.List | stored linked list from contract |
| _node | uint256 | new entry to push to the tail |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool true if success, false otherwise |

