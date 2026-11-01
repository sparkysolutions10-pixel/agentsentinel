import { describe, it, expect } from 'vitest';
import { GeoIpCountryAllowlist } from '../src/utils/geo_ip_country_allowlist.js';

describe('GeoIpCountryAllowlist', () => {
  it('checks ISO country code against allowlist', () => {
    expect(GeoIpCountryAllowlist.isAllowed('IN', ['US', 'IN', 'GB'])).toBe(true);
    expect(GeoIpCountryAllowlist.isAllowed('RU', ['US', 'IN', 'GB'])).toBe(false);
  });
});
