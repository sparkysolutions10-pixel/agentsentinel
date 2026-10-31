import { describe, it, expect } from 'vitest';
import { X509FingerprintExtractor } from '../src/utils/x509_fingerprint_extractor.js';

describe('X509FingerprintExtractor', () => {
  const dummyCert = Buffer.from('dummy_certificate_content');

  it('extracts formatted SHA-256 fingerprint with colon separators', () => {
    const fp = X509FingerprintExtractor.extractSha256(dummyCert);
    expect(fp).toContain(':');
    expect(fp.split(':').length).toBe(32);
  });

  it('matches pinned fingerprint ignoring separators', () => {
    const fp = X509FingerprintExtractor.extractSha256(dummyCert);
    expect(X509FingerprintExtractor.matches(dummyCert, fp)).toBe(true);
    expect(X509FingerprintExtractor.matches(dummyCert, fp.replace(/:/g, ''))).toBe(true);
    expect(X509FingerprintExtractor.matches(dummyCert, '00:11:22:33')).toBe(false);
  });
});
