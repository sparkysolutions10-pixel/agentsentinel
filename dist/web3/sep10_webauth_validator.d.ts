/**
 * AgentSentinel - SEP-10 Stellar Web Authentication Validator
 * Validates SEP-10 cryptographic challenges to prevent replay attacks,
 * domain spoofing, and expired authorization attempts.
 */
import { SentinelRule } from '../types.js';
export interface Sep10ValidatorConfig {
    expectedHomeDomain?: string;
    maxGracePeriodSeconds?: number;
}
export declare function createSep10WebAuthRule(config?: Sep10ValidatorConfig): SentinelRule;
//# sourceMappingURL=sep10_webauth_validator.d.ts.map