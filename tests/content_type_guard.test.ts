import { describe, it, expect } from 'vitest';
import { ContentTypeGuard } from '../src/utils/content_type_guard.js';

describe('ContentTypeGuard', () => {
  it('identifies standard JSON content types with parameters', () => {
    expect(ContentTypeGuard.isJsonContentType('application/json')).toBe(true);
    expect(ContentTypeGuard.isJsonContentType('application/json; charset=utf-8')).toBe(true);
    expect(ContentTypeGuard.isJsonContentType('application/problem+json')).toBe(true);
  });

  it('rejects non-JSON content types', () => {
    expect(ContentTypeGuard.isJsonContentType('text/html')).toBe(false);
    expect(ContentTypeGuard.isJsonContentType('application/x-www-form-urlencoded')).toBe(false);
  });
});
