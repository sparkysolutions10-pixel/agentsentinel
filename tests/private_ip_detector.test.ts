import { describe, it, expect } from 'vitest';
import { PrivateIpDetector } from '../src/utils/private_ip_detector.js';

describe('PrivateIpDetector', () => {
  it('identifies RFC-1918 and loopback IPv4 addresses as private', () => {
    expect(PrivateIpDetector.isPrivateOrLocal('127.0.0.1')).toBe(true);
    expect(PrivateIpDetector.isPrivateOrLocal('10.0.1.5')).toBe(true);
    expect(PrivateIpDetector.isPrivateOrLocal('192.168.0.1')).toBe(true);
    expect(PrivateIpDetector.isPrivateOrLocal('172.20.10.2')).toBe(true);
    expect(PrivateIpDetector.isPrivateOrLocal('169.254.169.254')).toBe(true); // cloud metadata
  });

  it('permits public IP addresses', () => {
    expect(PrivateIpDetector.isPrivateOrLocal('8.8.8.8')).toBe(false);
    expect(PrivateIpDetector.isPrivateOrLocal('1.1.1.1')).toBe(false);
    expect(PrivateIpDetector.isPrivateOrLocal('140.82.121.4')).toBe(false); // github.com
  });
});
