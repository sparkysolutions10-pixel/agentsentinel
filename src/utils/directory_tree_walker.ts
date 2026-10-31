/**
 * DirectoryTreeWalker - In-memory tree traversal helper with safety limits.
 */

export interface TreeNode {
  name: string;
  isDirectory: boolean;
  children?: TreeNode[];
}

export interface WalkerLimits {
  maxDepth: number;
  maxEntries: number;
}

export class DirectoryTreeWalker {
  public static walk(
    root: TreeNode,
    limits: WalkerLimits = { maxDepth: 5, maxEntries: 100 }
  ): string[] {
    const collected: string[] = [];

    const traverse = (node: TreeNode, currentDepth: number, currentPath: string) => {
      if (collected.length >= limits.maxEntries) return;
      if (currentDepth > limits.maxDepth) return;

      const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
      collected.push(fullPath);

      if (node.isDirectory && node.children) {
        for (const child of node.children) {
          if (collected.length >= limits.maxEntries) break;
          traverse(child, currentDepth + 1, fullPath);
        }
      }
    };

    traverse(root, 0, '');
    return collected;
  }
}
