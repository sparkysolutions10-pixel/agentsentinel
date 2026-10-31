import { describe, it, expect } from 'vitest';
import { Ipv4SubnetMatcher } from '../src/utils/ipv4_subnet_matcher.js';

describe('Ipv4SubnetMatcher', () => {
  it('correctly identifies IPs within CIDR subnets', () => {
    expect(Ipv4SubnetMatcher.isInSubnet('192.168.1.50', '192.168.1.0/24')).toBe(true);
    expect(Ipv4SubnetMatcher.isInSubnet('192.168.2.1', '192.168.1.0/24')).toBe(false);
    expect(Ipv4SubnetMatcher.isInSubnet('10.5.20.1', '10.0.0.0/8')).toBe(true);
    expect(Ipv4SubnetMatcher.isInSubnet('172.16.0.5', '172.16.0.5/32')).toBe(true);
  });
});
