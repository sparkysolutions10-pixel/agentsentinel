import { describe, it, expect } from 'vitest';
import { GdprRightToBeForgottenHandler } from '../src/utils/gdpr_right_to_be_forgotten_handler.js';

describe('GdprRightToBeForgottenHandler', () => {
  it('anonymizes identifying attributes', () => {
    const raw = { id: 101, email: 'user@example.com', name: 'John Doe', role: 'admin' };
    const anon = GdprRightToBeForgottenHandler.anonymize(raw);
    expect(anon.email).toBe('anonymized@gdpr.internal');
    expect(anon.name).toBe('Anonymous Subject');
    expect(anon.role).toBe('admin');
  });
});
