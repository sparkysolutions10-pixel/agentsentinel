import { describe, it, expect } from 'vitest';
import { TlsVersionChecker } from '../src/utils/tls_version_checker.js';

describe('TlsVersionChecker', () => {
  it('enforces minimum TLS 1.2 compliance', () => {
    expect(TlsVersionChecker.meetsMinimumVersion('TLSv1.3')).toBe(true);
    expect(TlsVersionChecker.meetsMinimumVersion('TLSv1.2')).toBe(true);
    expect(TlsVersionChecker.meetsMinimumVersion('TLSv1.1')).toBe(false);
    expect(TlsVersionChecker.meetsMinimumVersion('SSLv3')).toBe(false);
  });

  it('enforces strict TLS 1.3 requirement when configured', () => {
    expect(TlsVersionChecker.meetsMinimumVersion('TLSv1.3', 'TLSv1.3')).toBe(true);
    expect(TlsVersionChecker.meetsMinimumVersion('TLSv1.2', 'TLSv1.3')).toBe(false);
  });
});
