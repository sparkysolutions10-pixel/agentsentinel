import { describe, it, expect } from 'vitest';
import { ExecutableBitInspector } from '../src/utils/executable_bit_inspector.js';

describe('ExecutableBitInspector', () => {
  it('identifies 0755 executable permissions', () => {
    const perms = ExecutableBitInspector.inspect(0o755);
    expect(perms.user).toBe(true);
    expect(perms.group).toBe(true);
    expect(perms.others).toBe(true);
    expect(perms.isExecutable).toBe(true);
  });

  it('identifies 0644 non-executable permissions', () => {
    const perms = ExecutableBitInspector.inspect(0o644);
    expect(perms.user).toBe(false);
    expect(perms.group).toBe(false);
    expect(perms.others).toBe(false);
    expect(perms.isExecutable).toBe(false);
  });
});
