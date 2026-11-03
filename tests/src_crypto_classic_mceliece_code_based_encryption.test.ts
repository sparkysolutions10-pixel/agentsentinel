import { describe, it, expect } from 'vitest';
import { ClassicMcelieceCodeBasedEncryption } from '../src/crypto/classic_mceliece_code_based_encryption.js';

describe('ClassicMcelieceCodeBasedEncryption Invariant Suite (#2009)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ClassicMcelieceCodeBasedEncryption.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CLASSIC_MCELIECE_CODE_BASED_ENCRYPTION');
    expect(ClassicMcelieceCodeBasedEncryption.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ClassicMcelieceCodeBasedEncryption.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ClassicMcelieceCodeBasedEncryption.validate('git status && npm run test')).toBe(true);
  });
});
