/**
 * AgentSentinel - High-Risk Contract & Phishing Domain Blocker
 * Blocks interactions with known malicious smart contracts, drainer addresses,
 * and deceptive phishing domains mimicking decentralized finance protocols.
 */
import { SentinelRule } from '../types.js';
export interface HighRiskBlockerConfig {
    customBlacklist?: string[];
}
export declare function createHighRiskDomainBlockerRule(config?: HighRiskBlockerConfig): SentinelRule;
//# sourceMappingURL=high_risk_domain_blocker.d.ts.map