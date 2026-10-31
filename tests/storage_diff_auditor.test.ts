import { describe, it, expect } from 'vitest';
import { StorageFootprintDiffAuditor } from '../src/web3/storage_diff_auditor.js';

describe('StorageFootprintDiffAuditor', () => {
  it('computes created, modified, and deleted keys accurately', () => {
    const pre = { k1: 'val1', k2: 'val2' };
    const post = { k2: 'modified_val2', k3: 'val3' };

    const diff = StorageFootprintDiffAuditor.computeDiff(pre, post);
    expect(diff.createdKeys).toEqual(['k3']);
    expect(diff.modifiedKeys).toEqual(['k2']);
    expect(diff.deletedKeys).toEqual(['k1']);
  });
});
