import { describe, it, expect } from 'vitest';
import { CookieHeaderParser } from '../src/utils/cookie_header_parser.js';

describe('CookieHeaderParser', () => {
  it('parses cookie string into dictionary', () => {
    const parsed = CookieHeaderParser.parse('session_id=abc123; user=agent%20007; theme=dark');
    expect(parsed.session_id).toBe('abc123');
    expect(parsed.user).toBe('agent 007');
    expect(parsed.theme).toBe('dark');
  });
});
