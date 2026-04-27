import type { Category } from '@blog/shared'

export interface CategoryTreeNode extends Omit<Category, 'children'> {
  children: CategoryTreeNode[]
}

export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const map = new Map<number, CategoryTreeNode>()
  const roots: CategoryTreeNode[] = []

  categories.forEach((c) => {
    map.set(c.id, { ...c, children: [] })
  })

  categories.forEach((c) => {
    const node = map.get(c.id)!
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  const sortNodes = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => a.sort - b.sort || a.id - b.id)
    nodes.forEach((n) => sortNodes(n.children))
  }
  sortNodes(roots)

  return roots
}

export function collectAllIds(node: CategoryTreeNode): number[] {
  const ids = [node.id]
  node.children.forEach((child) => {
    ids.push(...collectAllIds(child))
  })
  return ids
}

export function getAllKeys(nodes: CategoryTreeNode[]): string[] {
  const keys: string[] = []
  const walk = (list: CategoryTreeNode[]) => {
    list.forEach((n) => {
      keys.push(String(n.id))
      walk(n.children)
    })
  }
  walk(nodes)
  return keys
}
