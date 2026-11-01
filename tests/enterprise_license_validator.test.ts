import { describe, it, expect } from 'vitest';
import { EnterpriseLicenseValidator } from '../src/utils/enterprise_license_validator.js';

describe('EnterpriseLicenseValidator', () => {
  it('validates active enterprise license', () => {
    expect(EnterpriseLicenseValidator.isValid({ tier: 'enterprise', seats: 50, expiresAt: 2500000000000 })).toBe(true);
    expect(EnterpriseLicenseValidator.isValid({ tier: 'enterprise', seats: 50, expiresAt: 1000 }, 2000)).toBe(false);
  });
});
