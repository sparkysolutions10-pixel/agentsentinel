import { describe, it, expect } from 'vitest';
import { WeaviateSchemaTamperingValidator } from '../src/db/weaviate_schema_tampering_validator.js';

describe('WeaviateSchemaTamperingValidator Invariant Suite (#1913)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = WeaviateSchemaTamperingValidator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_WEAVIATE_SCHEMA_TAMPERING_VALIDATOR');
    expect(WeaviateSchemaTamperingValidator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = WeaviateSchemaTamperingValidator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(WeaviateSchemaTamperingValidator.validate('git status && npm run test')).toBe(true);
  });
});
