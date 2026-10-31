import { describe, it, expect } from 'vitest';
import { TempFileNameGenerator } from '../src/utils/temp_file_name_generator.js';

describe('TempFileNameGenerator', () => {
  it('generates unique temp file paths with custom prefix and extension', () => {
    const p1 = TempFileNameGenerator.generate({ prefix: 'test_', extension: '.json' });
    const p2 = TempFileNameGenerator.generate({ prefix: 'test_', extension: '.json' });

    expect(p1).not.toBe(p2);
    expect(p1).toMatch(/test_\d+_[0-9a-f]{16}\.json$/);
  });
});
