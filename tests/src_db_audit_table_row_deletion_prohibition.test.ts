import { describe, it, expect } from 'vitest';
import { AuditTableRowDeletionProhibition } from '../src/db/audit_table_row_deletion_prohibition.js';

describe('AuditTableRowDeletionProhibition Invariant Suite (#1929)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = AuditTableRowDeletionProhibition.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_AUDIT_TABLE_ROW_DELETION_PROHIBITION');
    expect(AuditTableRowDeletionProhibition.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = AuditTableRowDeletionProhibition.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(AuditTableRowDeletionProhibition.validate('git status && npm run test')).toBe(true);
  });
});
