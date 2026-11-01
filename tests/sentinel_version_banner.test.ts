import { describe, it, expect } from 'vitest';
import { SentinelVersionBanner } from '../src/utils/sentinel_version_banner.js';

describe('SentinelVersionBanner', () => {
  it('formats banner with version string', () => {
    const banner = SentinelVersionBanner.getBanner('1.2.0');
    expect(banner).toContain('v1.2.0');
    expect(banner).toContain('AgentSentinel Pro');
  });
});
