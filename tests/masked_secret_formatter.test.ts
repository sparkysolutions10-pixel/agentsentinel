import { describe, it, expect } from 'vitest';
import { MaskedSecretFormatter } from '../src/utils/masked_secret_formatter.js';

describe('MaskedSecretFormatter', () => {
  it('masks sensitive API tokens with custom prefix and suffix', () => {
    const key = 'sk-proj-1234567890abcdef1234567890abcdef';
    const masked = MaskedSecretFormatter.mask(key, 7, 4);
    expect(masked.startsWith('sk-proj')).toBe(true);
    expect(masked.endsWith('cdef')).toBe(true);
    expect(masked).toContain('****');
  });

  it('masks very short secrets completely', () => {
    expect(MaskedSecretFormatter.mask('secret', 4, 4)).toBe('******');
  });
});
