import { describe, it, expect } from 'vitest';
import { SymlinkTargetInspector } from '../src/utils/symlink_target_inspector.js';

describe('SymlinkTargetInspector', () => {
  it('validates symlink target within root', () => {
    expect(SymlinkTargetInspector.isTargetInsideRoot('/app/src', '../public', '/app')).toBe(true);
    expect(SymlinkTargetInspector.isTargetInsideRoot('/app/src', '../../../etc/passwd', '/app')).toBe(false);
  });
});
