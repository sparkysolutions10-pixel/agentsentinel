import { describe, it, expect } from 'vitest';
import { DebounceLeadingTrailing } from '../src/utils/debounce_leading_trailing.js';

describe('DebounceLeadingTrailing', () => {
  it('executes function with leading edge option', async () => {
    let calls = 0;
    const debounced = DebounceLeadingTrailing.create(() => { calls++; }, 50, { leading: true, trailing: false });
    debounced();
    debounced();
    expect(calls).toBe(1);
  });
});
