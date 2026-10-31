/**
 * TenantQuotaAuditor - Multi-tenant resource quota boundary auditor.
 */

export interface TenantQuota {
  maxDailyRequests: number;
  maxMonthlyTokens: number;
}

export class TenantQuotaAuditor {
  private tenantUsage: Map<string, { requests: number; tokens: number }> = new Map();

  constructor(public readonly defaultQuota: TenantQuota) {}

  public recordUsage(tenantId: string, requests: number = 1, tokens: number = 0): void {
    const current = this.tenantUsage.get(tenantId) ?? { requests: 0, tokens: 0 };
    current.requests += requests;
    current.tokens += tokens;
    this.tenantUsage.set(tenantId, current);
  }

  public isWithinQuota(tenantId: string, customQuota?: TenantQuota): boolean {
    const quota = customQuota ?? this.defaultQuota;
    const usage = this.tenantUsage.get(tenantId) ?? { requests: 0, tokens: 0 };

    return usage.requests <= quota.maxDailyRequests && usage.tokens <= quota.maxMonthlyTokens;
  }
}
