import {createSlice, PayloadAction} from '@reduxjs/toolkit'

export interface Node {
  id: string;
  name: string;
  parentId?: string
  children?: Node[];
}

export interface TreeState {
  treeData: Node[];
}

export const treeSlice = createSlice({
  name: 'tree',
  initialState: {
    treeData: [
      {
        id: '1',
        name: 'Root',
        children: [],
      },
    ],
  } as TreeState,
  reducers: {
    setTreeData: (state, action: PayloadAction<Node[]>) => {
      state.treeData = action.payload
    },
    deleteNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload
      state.treeData = deleteNodeFromTree(state.treeData, nodeId)
    },
    addNode: (state, action: PayloadAction<{ parentId: string; newNode: Node }>) => {
      const {parentId, newNode} = action.payload
      state.treeData = addNodeToTree(state.treeData, parentId, newNode)
    },
    renameNode: (state, action: PayloadAction<{ nodeId: string; newName: string }>) => {
      const {nodeId, newName} = action.payload
      state.treeData = renameNodeInTree(state.treeData, nodeId, newName)
    },
  },
})

// Helper functions to update the tree data
export const checkIfNodeHasChildren = (treeData: Node[], nodeId: string): boolean => {
  const findNode = (nodes: Node[], targetId: string): boolean => {
    for (const node of nodes) {
      if (node.id === targetId && node.children && node.children.length > 0) {
        return true
      }
      if (node.children) {
        if (findNode(node.children, targetId)) {
          return true
        }
      }
    }
    return false
  }

  return findNode(treeData, nodeId)
}

const deleteNodeFromTree = (treeData: Node[], nodeId: string): Node[] => {
  return treeData.map((node) => {
    if (node.id === nodeId) {
      if (hasChildren(node)) {
        if (node.id !== '1')
          return node
      } else {
        return null
      }
    } else if (node.children) {
      return {
        ...node,
        children: deleteNodeFromTree(node.children, nodeId),
      }
    }
    return node
  }).filter((node): node is Node => !!node)
}

// Вспомогательная функция для проверки наличия потомков
const hasChildren = (node: Node): boolean => {
  return !!(node.children && node.children.length > 0)

}

const addNodeToTree = (treeData: Node[], parentId: string, newNode: Node): Node[] => {
  return treeData.map((node) => {
    if (node.id === parentId) {
      if (node.children) {
        return {
          ...node,
          children: [...node.children, newNode],
        }
      } else {
        return {
          ...node,
          children: [newNode],
        }
      }
    } else if (node.children) {
      return {
        ...node,
        children: addNodeToTree(node.children, parentId, newNode),
      }
    }
    return node
  })
}

const renameNodeInTree = (treeData: Node[], nodeId: string, newName: string): Node[] => {
  return treeData.map((node) => {
    if (node.id === nodeId) {
      return {
        ...node,
        name: newName,
      }
    } else if (node.children) {
      return {
        ...node,
        children: renameNodeInTree(node.children, nodeId, newName),
      }
    }
    return node
  })
}

export const {setTreeData, deleteNode, addNode, renameNode} = treeSlice.actions
export const treeReducer = treeSlice.reducer