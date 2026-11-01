import { describe, it, expect } from 'vitest';
import { ContentLengthEnforcer } from '../src/utils/content_length_enforcer.js';

describe('ContentLengthEnforcer', () => {
  it('enforces payload size ceiling', () => {
    expect(ContentLengthEnforcer.isWithinLimit('1024', 2048)).toBe(true);
    expect(ContentLengthEnforcer.isWithinLimit('4096', 2048)).toBe(false);
    expect(ContentLengthEnforcer.isWithinLimit('invalid', 2048)).toBe(false);
  });
});
