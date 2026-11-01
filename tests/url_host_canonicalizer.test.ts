import { describe, it, expect } from 'vitest';
import { UrlHostCanonicalizer } from '../src/utils/url_host_canonicalizer.js';

describe('UrlHostCanonicalizer', () => {
  it('strips redundant default ports and lowercases hosts', () => {
    expect(UrlHostCanonicalizer.canonicalize('HTTP://EXAMPLE.COM:80/path')).toBe('http://example.com/path');
    expect(UrlHostCanonicalizer.canonicalize('https://API.Stellar.Org:443/tx')).toBe('https://api.stellar.org/tx');
    expect(UrlHostCanonicalizer.canonicalize('https://custom.port:8443/')).toBe('https://custom.port:8443/');
  });
});
