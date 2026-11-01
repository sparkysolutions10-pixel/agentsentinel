import { describe, it, expect } from 'vitest';
import { TenantRateTierEnforcer } from '../src/utils/tenant_rate_tier_enforcer.js';

describe('TenantRateTierEnforcer', () => {
  it('returns rate limits by tier', () => {
    expect(TenantRateTierEnforcer.getLimits('enterprise').rpm).toBe(6000);
    expect(TenantRateTierEnforcer.getLimits('free').rpm).toBe(60);
    expect(TenantRateTierEnforcer.getLimits('unknown').rpm).toBe(60);
  });
});
