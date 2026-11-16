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
export declare class DirectoryTreeWalker {
    static walk(root: TreeNode, limits?: WalkerLimits): string[];
}
//# sourceMappingURL=directory_tree_walker.d.ts.map