import { describe, it, expect } from 'vitest';
import { AllowedKeysValidator } from '../src/utils/allowed_keys_validator.js';

describe('AllowedKeysValidator', () => {
  it('validates objects with only allowed keys', () => {
    const obj = { id: 1, name: 'agent' };
    expect(AllowedKeysValidator.hasOnlyAllowedKeys(obj, ['id', 'name', 'meta'])).toBe(true);
    expect(AllowedKeysValidator.hasOnlyAllowedKeys(obj, ['id'])).toBe(false);
  });

  it('returns list of unexpected keys', () => {
    const obj = { id: 1, inject: true, hack: 'cmd' };
    const unexpected = AllowedKeysValidator.getUnexpectedKeys(obj, ['id']);
    expect(unexpected).toEqual(['inject', 'hack']);
  });
});
