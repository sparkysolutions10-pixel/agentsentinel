import { describe, it, expect } from 'vitest';
import { UuidV4Validator } from '../src/utils/uuid_v4_validator.js';

describe('UuidV4Validator', () => {
  it('validates UUID v4 formatting', () => {
    expect(UuidV4Validator.isValid('c56a4180-65aa-42ec-a945-5fd21dec0538')).toBe(true);
    expect(UuidV4Validator.isValid('C56A4180-65AA-42EC-A945-5FD21DEC0538')).toBe(true);
    expect(UuidV4Validator.isValid('c56a4180-65aa-12ec-a945-5fd21dec0538')).toBe(false); // v1 not v4
    expect(UuidV4Validator.isValid('not-a-uuid')).toBe(false);
  });

  it('normalizes valid UUIDs to lowercase', () => {
    const uuid = 'C56A4180-65AA-42EC-A945-5FD21DEC0538';
    expect(UuidV4Validator.normalize(uuid)).toBe('c56a4180-65aa-42ec-a945-5fd21dec0538');
  });
});
