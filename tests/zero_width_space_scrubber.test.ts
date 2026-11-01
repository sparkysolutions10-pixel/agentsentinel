import { describe, it, expect } from 'vitest';
import { ZeroWidthSpaceScrubber } from '../src/utils/zero_width_space_scrubber.js';

describe('ZeroWidthSpaceScrubber', () => {
  it('strips zero-width characters cleanly', () => {
    const dirty = 'h\u200Be\u200Cl\u200Dlo';
    expect(ZeroWidthSpaceScrubber.hasZeroWidth(dirty)).toBe(true);
    expect(ZeroWidthSpaceScrubber.scrub(dirty)).toBe('hello');
  });
});
