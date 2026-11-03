import { describe, it, expect } from 'vitest';
import { MkfsFilesystemFormatBlocker } from '../src/ast/mkfs_filesystem_format_blocker.js';

describe('MkfsFilesystemFormatBlocker Invariant Suite (#1874)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = MkfsFilesystemFormatBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MKFS_FILESYSTEM_FORMAT_BLOCKER');
    expect(MkfsFilesystemFormatBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = MkfsFilesystemFormatBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(MkfsFilesystemFormatBlocker.validate('git status && npm run test')).toBe(true);
  });
});
