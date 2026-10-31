import { describe, it, expect } from 'vitest';
import { CaseInsensitiveHeaderMap } from '../src/utils/case_insensitive_header_map.js';

describe('CaseInsensitiveHeaderMap', () => {
  it('retrieves and checks headers regardless of casing', () => {
    const headers = new CaseInsensitiveHeaderMap({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token123'
    });

    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('CONTENT-TYPE')).toBe('application/json');
    expect(headers.has('authorization')).toBe(true);
    expect(headers.has('x-missing')).toBe(false);
  });

  it('converts back to object preserving casing', () => {
    const headers = new CaseInsensitiveHeaderMap();
    headers.set('X-Api-Key', 'secret');
    headers.set('x-api-key', 'updated');

    const obj = headers.toObject();
    expect(headers.get('X-API-KEY')).toBe('updated');
    expect(obj['x-api-key']).toBe('updated');
  });
});
