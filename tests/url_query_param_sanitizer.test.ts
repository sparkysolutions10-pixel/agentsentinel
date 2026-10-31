import { describe, it, expect } from 'vitest';
import { UrlQueryParamSanitizer } from '../src/utils/url_query_param_sanitizer.js';

describe('UrlQueryParamSanitizer', () => {
  it('redacts sensitive query parameters', () => {
    const raw = 'https://api.example.com/v1/data?apiKey=secret123&user=john&access_token=xyz';
    const sanitized = UrlQueryParamSanitizer.sanitize(raw);
    expect(sanitized).toContain('apiKey=%5BREDACTED%5D');
    expect(sanitized).toContain('access_token=%5BREDACTED%5D');
    expect(sanitized).toContain('user=john');
  });

  it('preserves clean URLs without query parameters', () => {
    const raw = 'https://api.example.com/v1/health';
    expect(UrlQueryParamSanitizer.sanitize(raw)).toBe(raw);
  });
});
