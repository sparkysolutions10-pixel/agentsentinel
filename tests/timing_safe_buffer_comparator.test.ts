import { describe, it, expect } from 'vitest';
import { TimingSafeBufferComparator } from '../src/utils/timing_safe_buffer_comparator.js';

describe('TimingSafeBufferComparator', () => {
  it('returns true for identical buffers', () => {
    const a = Buffer.from('secret-hash-1234');
    const b = Buffer.from('secret-hash-1234');
    expect(TimingSafeBufferComparator.equals(a, b)).toBe(true);
  });

  it('returns false for different buffers or lengths', () => {
    const a = Buffer.from('secret-hash-1234');
    const b = Buffer.from('secret-hash-5678');
    const c = Buffer.from('short');
    expect(TimingSafeBufferComparator.equals(a, b)).toBe(false);
    expect(TimingSafeBufferComparator.equals(a, c)).toBe(false);
  });
});
