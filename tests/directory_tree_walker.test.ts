import { describe, it, expect } from 'vitest';
import { DirectoryTreeWalker, TreeNode } from '../src/utils/directory_tree_walker.js';

describe('DirectoryTreeWalker', () => {
  const tree: TreeNode = {
    name: 'root',
    isDirectory: true,
    children: [
      { name: 'file1.txt', isDirectory: false },
      {
        name: 'sub',
        isDirectory: true,
        children: [{ name: 'file2.txt', isDirectory: false }]
      }
    ]
  };

  it('walks tree and collects all paths', () => {
    const paths = DirectoryTreeWalker.walk(tree);
    expect(paths).toEqual(['root', 'root/file1.txt', 'root/sub', 'root/sub/file2.txt']);
  });

  it('respects entry limits', () => {
    const paths = DirectoryTreeWalker.walk(tree, { maxDepth: 5, maxEntries: 2 });
    expect(paths.length).toBe(2);
  });
});
