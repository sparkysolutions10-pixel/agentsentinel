import { describe, it, expect } from 'vitest';
import { PolicyDiffAuditor } from '../src/utils/policy_diff_auditor.js';

describe('PolicyDiffAuditor', () => {
  it('detects policy relaxations when a blocking rule is set to allow', () => {
    const oldP = [{ id: 'R1', action: 'block' as const }];
    const newP = [{ id: 'R1', action: 'allow' as const }];

    const diff = PolicyDiffAuditor.compare(oldP, newP);
    expect(diff.isRelaxed).toBe(true);
    expect(diff.modifiedRules).toHaveLength(1);
  });
});
