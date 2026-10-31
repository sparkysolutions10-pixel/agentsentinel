import { describe, it, expect } from 'vitest';
import { Iso8601Validator } from '../src/utils/iso8601_validator.js';

describe('Iso8601Validator', () => {
  it('validates ISO-8601 strings', () => {
    expect(Iso8601Validator.isValid('2026-10-31T12:00:00Z')).toBe(true);
    expect(Iso8601Validator.isValid('2026-10-31T12:00:00.123Z')).toBe(true);
    expect(Iso8601Validator.isValid('2026-10-31')).toBe(true);
    expect(Iso8601Validator.isValid('invalid-date')).toBe(false);
    expect(Iso8601Validator.isValid('2026-02-31T12:00:00Z')).toBe(false); // Feb 31 invalid
  });

  it('parses valid dates into Date objects', () => {
    const d = Iso8601Validator.parseDate('2026-10-31T12:00:00Z');
    expect(d).not.toBeNull();
    expect(d?.getUTCFullYear()).toBe(2026);
  });
});
