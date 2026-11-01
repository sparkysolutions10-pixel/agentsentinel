import { describe, it, expect } from 'vitest';
import { PathTraversalPreventer } from '../src/utils/path_traversal_preventer.js';

describe('PathTraversalPreventer', () => {
  it('validates safe paths and rejects path traversal', () => {
    expect(PathTraversalPreventer.isSafePath('/app/data', 'sub/file.txt')).toBe(true);
    expect(PathTraversalPreventer.isSafePath('/app/data', '../../etc/passwd')).toBe(false);
  });
});
