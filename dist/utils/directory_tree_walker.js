/**
 * DirectoryTreeWalker - In-memory tree traversal helper with safety limits.
 */
export class DirectoryTreeWalker {
    static walk(root, limits = { maxDepth: 5, maxEntries: 100 }) {
        const collected = [];
        const traverse = (node, currentDepth, currentPath) => {
            if (collected.length >= limits.maxEntries)
                return;
            if (currentDepth > limits.maxDepth)
                return;
            const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
            collected.push(fullPath);
            if (node.isDirectory && node.children) {
                for (const child of node.children) {
                    if (collected.length >= limits.maxEntries)
                        break;
                    traverse(child, currentDepth + 1, fullPath);
                }
            }
        };
        traverse(root, 0, '');
        return collected;
    }
}
//# sourceMappingURL=directory_tree_walker.js.map