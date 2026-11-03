import { describe, it, expect } from 'vitest';
import { DbtModelMaterializationGuard } from '../src/db/dbt_model_materialization_guard.js';

describe('DbtModelMaterializationGuard Invariant Suite (#1950)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DbtModelMaterializationGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DBT_MODEL_MATERIALIZATION_GUARD');
    expect(DbtModelMaterializationGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DbtModelMaterializationGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DbtModelMaterializationGuard.validate('git status && npm run test')).toBe(true);
  });
});
