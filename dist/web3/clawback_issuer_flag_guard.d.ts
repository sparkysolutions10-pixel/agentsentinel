/**
 * AgentSentinel - Stellar Asset Clawback & Revocable Flag Detector
 * Checks asset issuer authorization flags (AUTH_REVOCABLE, AUTH_CLAWBACK_ENABLED)
 * before acquiring assets to guard autonomous agents against unexpected fund seizures.
 */
import { SentinelRule } from '../types.js';
export interface ClawbackIssuerConfig {
    allowClawbackAssets?: boolean;
}
export declare function createClawbackIssuerFlagRule(config?: ClawbackIssuerConfig): SentinelRule;
//# sourceMappingURL=clawback_issuer_flag_guard.d.ts.map