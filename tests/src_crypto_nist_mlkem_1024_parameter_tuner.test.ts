import { describe, it, expect } from 'vitest';
import { NistMlkem1024ParameterTuner } from '../src/crypto/nist_mlkem_1024_parameter_tuner.js';

describe('NistMlkem1024ParameterTuner Invariant Suite (#2004)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = NistMlkem1024ParameterTuner.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_NIST_MLKEM_1024_PARAMETER_TUNER');
    expect(NistMlkem1024ParameterTuner.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = NistMlkem1024ParameterTuner.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(NistMlkem1024ParameterTuner.validate('git status && npm run test')).toBe(true);
  });
});
