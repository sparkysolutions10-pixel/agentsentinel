import { describe, it, expect } from 'vitest';
import { DatabaseTlsCertificateCipherAudit } from '../src/db/database_tls_certificate_cipher_audit.js';

describe('DatabaseTlsCertificateCipherAudit Invariant Suite (#1939)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DatabaseTlsCertificateCipherAudit.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DATABASE_TLS_CERTIFICATE_CIPHER_AUDIT');
    expect(DatabaseTlsCertificateCipherAudit.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DatabaseTlsCertificateCipherAudit.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DatabaseTlsCertificateCipherAudit.validate('git status && npm run test')).toBe(true);
  });
});
