import { describe, it, expect } from 'vitest';
import { PortRangeValidator } from '../src/utils/port_range_validator.js';

describe('PortRangeValidator', () => {
  it('validates port number bounds', () => {
    expect(PortRangeValidator.isValidPort(80)).toBe(true);
    expect(PortRangeValidator.isValidPort(65535)).toBe(true);
    expect(PortRangeValidator.isValidPort(0)).toBe(false);
    expect(PortRangeValidator.isValidPort(70000)).toBe(false);
  });

  it('parses composite port ranges', () => {
    const ports = PortRangeValidator.parseRanges('80, 443, 8000-8002');
    expect(ports).toEqual([80, 443, 8000, 8001, 8002]);
  });

  it('verifies allowed ports accurately', () => {
    expect(PortRangeValidator.isPortAllowed(443, '80, 443')).toBe(true);
    expect(PortRangeValidator.isPortAllowed(22, '80, 443')).toBe(false);
  });
});
