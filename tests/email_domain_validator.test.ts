import { describe, it, expect } from 'vitest';
import { EmailDomainValidator } from '../src/utils/email_domain_validator.js';

describe('EmailDomainValidator', () => {
  it('validates legitimate emails correctly', () => {
    expect(EmailDomainValidator.isValid('agent@sentinel.dev')).toBe(true);
    expect(EmailDomainValidator.isValid('security.officer@corp.example.com')).toBe(true);
    expect(EmailDomainValidator.isValid('invalid-email')).toBe(false);
    expect(EmailDomainValidator.isValid('')).toBe(false);
  });

  it('detects and blocks disposable domains when option enabled', () => {
    expect(EmailDomainValidator.isValid('test@mailinator.com', { blockDisposable: true })).toBe(false);
    expect(EmailDomainValidator.isValid('test@tempmail.com', { blockDisposable: true })).toBe(false);
    expect(EmailDomainValidator.isValid('test@validcorp.com', { blockDisposable: true })).toBe(true);
  });

  it('respects allowed and blocked domain lists', () => {
    expect(EmailDomainValidator.isValid('user@allowed.com', { allowedDomains: ['allowed.com'] })).toBe(true);
    expect(EmailDomainValidator.isValid('user@other.com', { allowedDomains: ['allowed.com'] })).toBe(false);
    expect(EmailDomainValidator.isValid('user@blocked.com', { blockedDomains: ['blocked.com'] })).toBe(false);
  });

  it('extracts domain from email string', () => {
    expect(EmailDomainValidator.extractDomain('alice@example.org')).toBe('example.org');
    expect(EmailDomainValidator.extractDomain('invalid')).toBe(null);
  });
});
