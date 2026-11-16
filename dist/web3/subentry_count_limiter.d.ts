/**
 * AgentSentinel - Stellar Subentry Count Limiter
 * Clamps maximum account subentries (trustlines, offers, signers, data entries)
 * to prevent account reserve lockouts and insufficient balance conditions.
 */
import { SentinelRule } from '../types.js';
export interface SubentryCountConfig {
    maxSubentries?: number;
}
export declare function createSubentryCountRule(config?: SubentryCountConfig): SentinelRule;
//# sourceMappingURL=subentry_count_limiter.d.ts.map