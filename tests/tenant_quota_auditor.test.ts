import { describe, it, expect } from 'vitest';
import { TenantQuotaAuditor } from '../src/utils/tenant_quota_auditor.js';

describe('TenantQuotaAuditor', () => {
  it('audits tenant limits accurately', () => {
    const auditor = new TenantQuotaAuditor({ maxDailyRequests: 100, maxMonthlyTokens: 10000 });

    auditor.recordUsage('tenant_1', 50, 5000);
    expect(auditor.isWithinQuota('tenant_1')).toBe(true);

    auditor.recordUsage('tenant_1', 60, 0); // 110 requests > 100
    expect(auditor.isWithinQuota('tenant_1')).toBe(false);
  });
});
