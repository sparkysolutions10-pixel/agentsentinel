import { describe, it, expect } from 'vitest';
import { SchtasksPrivilegeTaskCreator } from '../src/ast/schtasks_privilege_task_creator.js';

describe('SchtasksPrivilegeTaskCreator Invariant Suite (#1893)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SchtasksPrivilegeTaskCreator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SCHTASKS_PRIVILEGE_TASK_CREATOR');
    expect(SchtasksPrivilegeTaskCreator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SchtasksPrivilegeTaskCreator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SchtasksPrivilegeTaskCreator.validate('git status && npm run test')).toBe(true);
  });
});
