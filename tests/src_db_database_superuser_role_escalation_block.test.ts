import { describe, it, expect } from 'vitest';
import { DatabaseSuperuserRoleEscalationBlock } from '../src/db/database_superuser_role_escalation_block.js';

describe('DatabaseSuperuserRoleEscalationBlock Invariant Suite (#1928)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DatabaseSuperuserRoleEscalationBlock.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DATABASE_SUPERUSER_ROLE_ESCALATION_BLOCK');
    expect(DatabaseSuperuserRoleEscalationBlock.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DatabaseSuperuserRoleEscalationBlock.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DatabaseSuperuserRoleEscalationBlock.validate('git status && npm run test')).toBe(true);
  });
});
