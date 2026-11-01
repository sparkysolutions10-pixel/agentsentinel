import { describe, it, expect } from 'vitest';
import { DnsRebindingGuard } from '../src/utils/dns_rebinding_guard.js';

describe('DnsRebindingGuard', () => {
  it('blocks localhost and private cloud metadata ips', () => {
    expect(DnsRebindingGuard.isForbiddenTarget('localhost')).toBe(true);
    expect(DnsRebindingGuard.isForbiddenTarget('169.254.169.254')).toBe(true);
    expect(DnsRebindingGuard.isForbiddenTarget('192.168.1.1')).toBe(true);
    expect(DnsRebindingGuard.isForbiddenTarget('api.stellar.org')).toBe(false);
  });
});
