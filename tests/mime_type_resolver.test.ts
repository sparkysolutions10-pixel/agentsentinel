import { describe, it, expect } from 'vitest';
import { MimeTypeResolver } from '../src/utils/mime_type_resolver.js';

describe('MimeTypeResolver', () => {
  it('resolves correct mime type from file names', () => {
    expect(MimeTypeResolver.resolve('contract.wasm')).toBe('application/wasm');
    expect(MimeTypeResolver.resolve('data.json')).toBe('application/json');
    expect(MimeTypeResolver.resolve('unknown.xyz')).toBe('application/octet-stream');
  });
});
