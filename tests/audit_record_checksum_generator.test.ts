import { describe, it, expect } from 'vitest';
import { AuditRecordChecksumGenerator } from '../src/utils/audit_record_checksum_generator.js';

describe('AuditRecordChecksumGenerator', () => {
  it('computes deterministic chained sha256 checksum', () => {
    const h1 = AuditRecordChecksumGenerator.generate('GENESIS', { action: 'login' });
    const h2 = AuditRecordChecksumGenerator.generate('GENESIS', { action: 'login' });
    expect(h1).toBe(h2);
    expect(h1.length).toBe(64);
  });
});
