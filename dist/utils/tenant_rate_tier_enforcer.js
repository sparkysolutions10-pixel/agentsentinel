export class TenantRateTierEnforcer {
    static TIER_LIMITS = {
        free: { rpm: 60, rpd: 1000 },
        pro: { rpm: 600, rpd: 50000 },
        enterprise: { rpm: 6000, rpd: 1000000 }
    };
    static getLimits(tier) {
        return this.TIER_LIMITS[tier.toLowerCase()] || this.TIER_LIMITS.free;
    }
}
//# sourceMappingURL=tenant_rate_tier_enforcer.js.map