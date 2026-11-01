import { describe, it, expect } from 'vitest';
import { RoleBasedAccessEvaluator } from '../src/utils/role_based_access_evaluator.js';

describe('RoleBasedAccessEvaluator', () => {
  it('evaluates explicit and wildcard permissions', () => {
    expect(RoleBasedAccessEvaluator.hasPermission(['audit:*'], 'audit:read')).toBe(true);
    expect(RoleBasedAccessEvaluator.hasPermission(['audit:read'], 'audit:write')).toBe(false);
    expect(RoleBasedAccessEvaluator.hasPermission(['*'], 'any:action')).toBe(true);
  });
});
