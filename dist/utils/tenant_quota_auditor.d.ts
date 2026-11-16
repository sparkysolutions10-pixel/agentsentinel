/**
 * TenantQuotaAuditor - Multi-tenant resource quota boundary auditor.
 */
export interface TenantQuota {
    maxDailyRequests: number;
    maxMonthlyTokens: number;
}
export declare class TenantQuotaAuditor {
    readonly defaultQuota: TenantQuota;
    private tenantUsage;
    constructor(defaultQuota: TenantQuota);
    recordUsage(tenantId: string, requests?: number, tokens?: number): void;
    isWithinQuota(tenantId: string, customQuota?: TenantQuota): boolean;
}
//# sourceMappingURL=tenant_quota_auditor.d.ts.map