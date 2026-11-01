import { describe, it, expect } from 'vitest';
import { BasicAuthHeaderParser } from '../src/utils/basic_auth_header_parser.js';

describe('BasicAuthHeaderParser', () => {
  it('parses valid Basic auth credentials', () => {
    const creds = BasicAuthHeaderParser.parse('Basic YWxhZGRpbjpvcGVuc2VzYW1l');
    expect(creds?.username).toBe('aladdin');
    expect(creds?.password).toBe('opensesame');
  });

  it('returns null on invalid basic format', () => {
    expect(BasicAuthHeaderParser.parse('Bearer abc')).toBe(null);
  });
});
