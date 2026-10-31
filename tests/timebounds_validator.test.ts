import { describe, it, expect } from 'vitest';
import { TimeboundsValidator } from '../src/utils/timebounds_validator.js';

describe('TimeboundsValidator', () => {
  it('validates correct timebounds', () => {
    expect(TimeboundsValidator.isValidTimebounds({ minTime: 1000, maxTime: 2000 })).toBe(true);
    expect(TimeboundsValidator.isValidTimebounds({ minTime: 1000, maxTime: 0 })).toBe(true); // open-ended
  });

  it('rejects inverted timebounds (minTime > maxTime)', () => {
    expect(TimeboundsValidator.isValidTimebounds({ minTime: 2000, maxTime: 1000 })).toBe(false);
  });

  it('checks if current unix time falls within window', () => {
    const tb = { minTime: 100, maxTime: 200 };
    expect(TimeboundsValidator.isWithinTimebounds(tb, 150)).toBe(true);
    expect(TimeboundsValidator.isWithinTimebounds(tb, 50)).toBe(false);
    expect(TimeboundsValidator.isWithinTimebounds(tb, 250)).toBe(false);
  });
});
