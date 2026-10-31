import { describe, it, expect } from 'vitest';
import { BooleanFlagCoercer } from '../src/utils/boolean_flag_coercer.js';

describe('BooleanFlagCoercer', () => {
  it('coerces valid boolean representations', () => {
    expect(BooleanFlagCoercer.coerce(true)).toBe(true);
    expect(BooleanFlagCoercer.coerce('true')).toBe(true);
    expect(BooleanFlagCoercer.coerce('YES')).toBe(true);
    expect(BooleanFlagCoercer.coerce(1)).toBe(true);
    expect(BooleanFlagCoercer.coerce('enabled')).toBe(true);

    expect(BooleanFlagCoercer.coerce(false)).toBe(false);
    expect(BooleanFlagCoercer.coerce('false')).toBe(false);
    expect(BooleanFlagCoercer.coerce('0')).toBe(false);
    expect(BooleanFlagCoercer.coerce('disabled')).toBe(false);
  });

  it('returns null for ambiguous values', () => {
    expect(BooleanFlagCoercer.coerce('maybe')).toBeNull();
    expect(BooleanFlagCoercer.coerce(100)).toBeNull();
    expect(BooleanFlagCoercer.coerce(null)).toBeNull();
  });
});
