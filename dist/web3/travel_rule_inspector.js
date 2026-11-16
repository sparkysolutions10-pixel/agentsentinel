/**
 * AgentSentinel - FATF Travel Rule IVMS 101 Payload Inspector
 * Enforces transmission of originator/beneficiary compliance metadata
 * on transactions exceeding regulatory thresholds.
 */
import { Verdict } from '../types.js';
export function createTravelRuleInspector(config = {}) {
    const threshold = config.thresholdAmount ?? 1000;
    return {
        id: 'travel-rule-inspector',
        name: 'FATF Travel Rule Inspector',
        category: 'custom',
        priority: 85,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('transfer') && !tool.includes('pay') && !tool.includes('send')) {
                return null;
            }
            const params = context.params || {};
            const amount = Number(params.amount ?? params.value ?? 0);
            if (amount >= threshold) {
                const metadata = params.travelRule || params.ivms101 || params.complianceData;
                if (!metadata) {
                    return {
                        ruleId: 'travel-rule-inspector',
                        ruleName: 'FATF Travel Rule Inspector',
                        severity: 'high',
                        verdict: Verdict.BLOCK,
                        reason: `Transfer amount (${amount.toLocaleString()}) meets/exceeds Travel Rule regulatory threshold (${threshold.toLocaleString()}). IVMS 101 originator and beneficiary metadata missing.`,
                        detectedPattern: `TRAVEL_RULE_METADATA_MISSING:${amount}>=${threshold}`
                    };
                }
            }
            return null;
        }
    };
}
//# sourceMappingURL=travel_rule_inspector.js.map