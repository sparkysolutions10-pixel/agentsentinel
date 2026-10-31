import { describe, it, expect } from 'vitest';
import { FileSizeCeilingGuard } from '../src/utils/file_size_ceiling_guard.js';

describe('FileSizeCeilingGuard', () => {
  it('checks sizes against limits', () => {
    expect(FileSizeCeilingGuard.isWithinCeiling(1024, 2048)).toBe(true);
    expect(FileSizeCeilingGuard.isWithinCeiling(4096, 2048)).toBe(false);
  });

  it('throws on assertion failure', () => {
    expect(() => FileSizeCeilingGuard.assertWithinCeiling(1500, 1000)).toThrow('exceeds maximum allowed ceiling');
  });
});
