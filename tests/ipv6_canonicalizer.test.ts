import { describe, it, expect } from 'vitest';
import { Ipv6Canonicalizer } from '../src/utils/ipv6_canonicalizer.js';

describe('Ipv6Canonicalizer', () => {
  it('expands compressed IPv6 addresses', () => {
    expect(Ipv6Canonicalizer.expand('::1')).toBe('0000:0000:0000:0000:0000:0000:0000:0001');
    expect(Ipv6Canonicalizer.expand('2001:db8::1')).toBe('2001:0db8:0000:0000:0000:0000:0000:0001');
  });

  it('detects IPv6 loopback addresses', () => {
    expect(Ipv6Canonicalizer.isLoopback('::1')).toBe(true);
    expect(Ipv6Canonicalizer.isLoopback('2001:db8::1')).toBe(false);
  });
});
