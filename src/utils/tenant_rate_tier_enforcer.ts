export class TenantRateTierEnforcer {
  private static readonly TIER_LIMITS: Record<string, { rpm: number; rpd: number }> = {
    free: { rpm: 60, rpd: 1000 },
    pro: { rpm: 600, rpd: 50000 },
    enterprise: { rpm: 6000, rpd: 1000000 }
  };

  public static getLimits(tier: string): { rpm: number; rpd: number } {
    return this.TIER_LIMITS[tier.toLowerCase()] || this.TIER_LIMITS.free;
  }
}
