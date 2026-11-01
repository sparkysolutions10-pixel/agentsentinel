import { describe, it, expect } from 'vitest';
import { SafeFileReader } from '../src/utils/safe_file_reader.js';

describe('SafeFileReader', () => {
  it('validates file size within threshold', () => {
    expect(SafeFileReader.isSafeSize(1024, 2048)).toBe(true);
    expect(SafeFileReader.isSafeSize(5000, 2048)).toBe(false);
  });
});
