/**
 * TenantQuotaAuditor - Multi-tenant resource quota boundary auditor.
 */
export class TenantQuotaAuditor {
    defaultQuota;
    tenantUsage = new Map();
    constructor(defaultQuota) {
        this.defaultQuota = defaultQuota;
    }
    recordUsage(tenantId, requests = 1, tokens = 0) {
        const current = this.tenantUsage.get(tenantId) ?? { requests: 0, tokens: 0 };
        current.requests += requests;
        current.tokens += tokens;
        this.tenantUsage.set(tenantId, current);
    }
    isWithinQuota(tenantId, customQuota) {
        const quota = customQuota ?? this.defaultQuota;
        const usage = this.tenantUsage.get(tenantId) ?? { requests: 0, tokens: 0 };
        return usage.requests <= quota.maxDailyRequests && usage.tokens <= quota.maxMonthlyTokens;
    }
}
//# sourceMappingURL=tenant_quota_auditor.js.map