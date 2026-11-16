/**
 * AgentSentinel - High-Risk Contract & Phishing Domain Blocker
 * Blocks interactions with known malicious smart contracts, drainer addresses,
 * and deceptive phishing domains mimicking decentralized finance protocols.
 */
import { Verdict } from '../types.js';
const BLACKLISTED_ENTITIES = new Set([
    'phishing-stellar-dex.fake',
    'drainer-soroban-wallet.io',
    'CC7MALICIOUSCONTRACTHASH0000000000000000000000000000000000000000'
]);
export function createHighRiskDomainBlockerRule(config = {}) {
    const blacklist = new Set(BLACKLISTED_ENTITIES);
    if (config.customBlacklist) {
        for (const item of config.customBlacklist) {
            blacklist.add(item.toLowerCase());
        }
    }
    return {
        id: 'high-risk-domain-contract-blocker',
        name: 'High-Risk Contract & Phishing Domain Blocker',
        category: 'custom',
        priority: 100,
        enabled: true,
        evaluate(context) {
            const params = context.params || {};
            const target = String(params.contractId || params.domain || params.url || params.target || '').toLowerCase();
            for (const blocked of blacklist) {
                if (target.includes(blocked.toLowerCase())) {
                    return {
                        ruleId: 'high-risk-domain-contract-blocker',
                        ruleName: 'High-Risk Contract & Phishing Domain Blocker',
                        severity: 'critical',
                        verdict: Verdict.BLOCK,
                        reason: `Operation blocked: target "${target}" matches known malicious phishing domain or drainer contract.`,
                        detectedPattern: `BLACKLISTED_TARGET_DETECTED:${blocked}`
                    };
                }
            }
            return null;
        }
    };
}
//# sourceMappingURL=high_risk_domain_blocker.js.map