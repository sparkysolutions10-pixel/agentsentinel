import { describe, it, expect } from 'vitest';
import { CsvSanitizer } from '../src/utils/csv_sanitizer.js';

describe('CsvSanitizer', () => {
  it('neutralizes dangerous formula prefixes in cells', () => {
    expect(CsvSanitizer.sanitizeCell('=cmd|"/c calc"!A0')).toBe("'" + '=cmd|"/c calc"!A0');
    expect(CsvSanitizer.sanitizeCell('+12345')).toBe("'+12345");
    expect(CsvSanitizer.sanitizeCell('@SUM(A1:A10)')).toBe("'@SUM(A1:A10)");
    expect(CsvSanitizer.sanitizeCell('Normal Text')).toBe('Normal Text');
  });

  it('sanitizes full row arrays', () => {
    const row = ['ID', '=1+1', 'Safe Value'];
    const sanitized = CsvSanitizer.sanitizeRow(row);
    expect(sanitized).toEqual(['ID', "'=1+1", 'Safe Value']);
  });
});
