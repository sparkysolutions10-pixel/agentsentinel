import { describe, it, expect } from 'vitest';
import { HttpBearerTokenExtractor } from '../src/utils/http_bearer_token_extractor.js';

describe('HttpBearerTokenExtractor', () => {
  it('extracts token from valid bearer authorization headers', () => {
    expect(HttpBearerTokenExtractor.extract('Bearer eyJhbGciOi...')).toBe('eyJhbGciOi...');
    expect(HttpBearerTokenExtractor.extract('bearer token123')).toBe('token123');
    expect(HttpBearerTokenExtractor.extract('Basic dXNlcjpwYXNz')).toBe(null);
    expect(HttpBearerTokenExtractor.extract(null)).toBe(null);
  });
});
