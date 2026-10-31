import { describe, it, expect } from 'vitest';
import { HttpMethodAllowlist } from '../src/utils/http_method_allowlist.js';

describe('HttpMethodAllowlist', () => {
  it('validates methods against configurable allowlists', () => {
    expect(HttpMethodAllowlist.isValid('GET', ['GET', 'POST'])).toBe(true);
    expect(HttpMethodAllowlist.isValid('post', ['GET', 'POST'])).toBe(true);
    expect(HttpMethodAllowlist.isValid('DELETE', ['GET', 'POST'])).toBe(false);
    expect(HttpMethodAllowlist.isValid('TRACE', ['GET', 'POST'])).toBe(false);
  });

  it('distinguishes read-only safe HTTP methods', () => {
    expect(HttpMethodAllowlist.isSafeMethod('GET')).toBe(true);
    expect(HttpMethodAllowlist.isSafeMethod('POST')).toBe(false);
  });
});
