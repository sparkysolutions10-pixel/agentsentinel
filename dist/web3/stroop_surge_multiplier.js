/**
 * AgentSentinel - Stroop Surge Multiplier Clamp
 * Clamps transaction base fees against rolling median network fees
 * to prevent runaway bidding wars during brief congestion spikes.
 */
import { Verdict } from '../types.js';
export function createStroopSurgeMultiplierRule(config = {}) {
    const maxMultiplier = config.maxMultiplier ?? 3.0;
    const defaultMedian = config.defaultMedianStroops ?? 100;
    return {
        id: 'stroop-surge-multiplier-clamp',
        name: 'Stroop Surge Multiplier Clamp',
        category: 'custom',
        priority: 85,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('tx') && !tool.includes('stellar') && !tool.includes('soroban') && !tool.includes('fee')) {
                return null;
            }
            const params = context.params || {};
            const fee = Number(params.baseFee ?? params.fee ?? 0);
            const medianFee = Number(params.rollingMedianFee ?? params.medianFee ?? defaultMedian);
            if (fee <= 0) {
                return null;
            }
            const allowedMax = medianFee * maxMultiplier;
            if (fee > allowedMax) {
                return {
                    ruleId: 'stroop-surge-multiplier-clamp',
                    ruleName: 'Stroop Surge Multiplier Clamp',
                    severity: 'high',
                    verdict: Verdict.BLOCK,
                    reason: `Transaction fee (${fee} stroops) exceeds surge ceiling (${allowedMax} stroops, ${maxMultiplier}x median ${medianFee}). Congestion surge clamp engaged.`,
                    detectedPattern: `SURGE_MULTIPLIER_EXCEEDED:${fee}>${allowedMax}`
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=stroop_surge_multiplier.js.map