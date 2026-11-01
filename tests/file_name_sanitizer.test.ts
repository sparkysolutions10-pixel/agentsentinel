import { describe, it, expect } from 'vitest';
import { FileNameSanitizer } from '../src/utils/file_name_sanitizer.js';

describe('FileNameSanitizer', () => {
  it('replaces dangerous file characters', () => {
    expect(FileNameSanitizer.sanitize('my:file/name*.txt')).toBe('my_file_name_.txt');
  });
});
