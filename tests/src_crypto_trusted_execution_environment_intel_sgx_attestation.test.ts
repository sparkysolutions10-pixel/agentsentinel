import { describe, it, expect } from 'vitest';
import { TrustedExecutionEnvironmentIntelSgxAttestation } from '../src/crypto/trusted_execution_environment_intel_sgx_attestation.js';

describe('TrustedExecutionEnvironmentIntelSgxAttestation Invariant Suite (#2027)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = TrustedExecutionEnvironmentIntelSgxAttestation.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_TRUSTED_EXECUTION_ENVIRONMENT_INTEL_SGX_ATTESTATION');
    expect(TrustedExecutionEnvironmentIntelSgxAttestation.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = TrustedExecutionEnvironmentIntelSgxAttestation.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(TrustedExecutionEnvironmentIntelSgxAttestation.validate('git status && npm run test')).toBe(true);
  });
});
