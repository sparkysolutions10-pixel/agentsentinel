import { describe, it, expect } from 'vitest';
import { TypeormRawQueryParameterChecker } from '../src/db/typeorm_raw_query_parameter_checker.js';

describe('TypeormRawQueryParameterChecker Invariant Suite (#1951)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = TypeormRawQueryParameterChecker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_TYPEORM_RAW_QUERY_PARAMETER_CHECKER');
    expect(TypeormRawQueryParameterChecker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = TypeormRawQueryParameterChecker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(TypeormRawQueryParameterChecker.validate('git status && npm run test')).toBe(true);
  });
});
