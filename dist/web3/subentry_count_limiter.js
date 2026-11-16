/**
 * AgentSentinel - Stellar Subentry Count Limiter
 * Clamps maximum account subentries (trustlines, offers, signers, data entries)
 * to prevent account reserve lockouts and insufficient balance conditions.
 */
import { Verdict } from '../types.js';
export function createSubentryCountRule(config = {}) {
    const maxLimit = config.maxSubentries ?? 950;
    return {
        id: 'subentry-count-limiter',
        name: 'Stellar Subentry Count Limiter',
        category: 'custom',
        priority: 80,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('trustline') && !tool.includes('offer') && !tool.includes('signer') && !tool.includes('subentry')) {
                return null;
            }
            const params = context.params || {};
            const currentSubentries = Number(params.currentSubentries ?? params.subentryCount ?? params.subentries ?? 0);
            const newEntries = Number(params.newSubentries ?? params.entriesCount ?? 1);
            if (currentSubentries + newEntries > maxLimit) {
                return {
                    ruleId: 'subentry-count-limiter',
                    ruleName: 'Stellar Subentry Count Limiter',
                    severity: 'high',
                    verdict: Verdict.BLOCK,
                    reason: `Account subentry threshold reached: resulting count (${currentSubentries + newEntries}) exceeds safety ceiling (${maxLimit}). Further trustline/offer creation halted to protect reserve balance.`,
                    detectedPattern: `SUBENTRY_CEILING_EXCEEDED:${currentSubentries + newEntries}>${maxLimit}`
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=subentry_count_limiter.js.map