import { describe, it, expect } from 'vitest';
import { HkdfKeyExpander } from '../src/utils/hkdf_key_expander.js';

describe('HkdfKeyExpander', () => {
  it('derives specified byte length deterministic keys', () => {
    const ikm = Buffer.from('input-key-material');
    const salt = Buffer.from('salt-123');
    const info = Buffer.from('context-info');
    const derived = HkdfKeyExpander.deriveKey(ikm, salt, info, 48);
    expect(derived.length).toBe(48);

    const derived2 = HkdfKeyExpander.deriveKey(ikm, salt, info, 48);
    expect(derived.equals(derived2)).toBe(true);
  });
});
