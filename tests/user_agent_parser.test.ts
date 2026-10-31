import { describe, it, expect } from 'vitest';
import { UserAgentParser } from '../src/utils/user_agent_parser.js';

describe('UserAgentParser', () => {
  it('flags known automated vulnerability scanners', () => {
    const info = UserAgentParser.parse('Mozilla/5.0 (compatible; Nikto/2.1.6)');
    expect(info.isScanner).toBe(true);
    expect(info.isBot).toBe(true);
  });

  it('detects standard HTTP CLI libraries', () => {
    const info = UserAgentParser.parse('curl/7.68.0');
    expect(info.isBot).toBe(true);
    expect(info.isScanner).toBe(false);
  });

  it('identifies standard browsers as non-scanners', () => {
    const info = UserAgentParser.parse('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    expect(info.isScanner).toBe(false);
  });
});
