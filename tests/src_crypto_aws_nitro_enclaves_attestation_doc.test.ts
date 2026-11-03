import { describe, it, expect } from 'vitest';
import { AwsNitroEnclavesAttestationDoc } from '../src/crypto/aws_nitro_enclaves_attestation_doc.js';

describe('AwsNitroEnclavesAttestationDoc Invariant Suite (#2029)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = AwsNitroEnclavesAttestationDoc.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_AWS_NITRO_ENCLAVES_ATTESTATION_DOC');
    expect(AwsNitroEnclavesAttestationDoc.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = AwsNitroEnclavesAttestationDoc.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(AwsNitroEnclavesAttestationDoc.validate('git status && npm run test')).toBe(true);
  });
});
