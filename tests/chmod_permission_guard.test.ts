import { describe, it, expect } from 'vitest';
import { ChmodPermissionGuard } from '../src/utils/chmod_permission_guard.js';

describe('ChmodPermissionGuard', () => {
  it('blocks world-writable permissions', () => {
    expect(ChmodPermissionGuard.isSafePermission(0o644)).toBe(true);
    expect(ChmodPermissionGuard.isSafePermission(0o755)).toBe(true);
    expect(ChmodPermissionGuard.isSafePermission(0o777)).toBe(false);
    expect(ChmodPermissionGuard.isSafePermission(0o666)).toBe(false);
  });
});
