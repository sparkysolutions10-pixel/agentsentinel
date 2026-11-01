import { describe, it, expect } from 'vitest';
import { StructuredLogRedactor } from '../src/utils/structured_log_redactor.js';

describe('StructuredLogRedactor', () => {
  it('redacts sensitive fields in nested objects', () => {
    const raw = {
      user: 'alice',
      auth: {
        token: 'secret-token-xyz',
        headers: {
          authorization: 'Bearer 1234'
        }
      }
    };
    const redacted = StructuredLogRedactor.redact(raw);
    expect(redacted.user).toBe('alice');
    expect(redacted.auth.token).toBe('[REDACTED]');
    expect(redacted.auth.headers.authorization).toBe('[REDACTED]');
  });
});
