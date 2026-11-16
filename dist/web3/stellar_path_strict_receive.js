/**
 * AgentSentinel - PathPaymentStrictReceive Maximum Send Budget Clamp
 * Enforces strict sendMax ceilings on PathPaymentStrictReceive operations
 * to prevent autonomous agents from overpaying for a fixed destination asset.
 */
import { Verdict } from '../types.js';
export function createStellarPathStrictReceiveClampRule(config = {}) {
    const maxMultiplier = config.maxBudgetMultiplier ?? 1.05;
    return {
        id: 'stellar-path-strict-receive-clamp',
        name: 'Stellar PathPaymentStrictReceive Clamp',
        category: 'custom',
        priority: 83,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('path') && !tool.includes('strict_receive') && !tool.includes('payment')) {
                return null;
            }
            const params = context.params || {};
            const expectedSend = Number(params.expectedSendAmount || params.sendAmount || 0);
            const sendMax = Number(params.sendMax || params.maxSendAmount || 0);
            if (sendMax <= 0) {
                return {
                    ruleId: 'stellar-path-strict-receive-clamp',
                    ruleName: 'Stellar PathPaymentStrictReceive Clamp',
                    severity: 'high',
                    verdict: Verdict.BLOCK,
                    reason: 'PathPaymentStrictReceive missing sendMax parameter. Uncapped budget overpayment risk.',
                    detectedPattern: 'PATH_PAYMENT_MISSING_SEND_MAX',
                };
            }
            if (expectedSend > 0 && sendMax > (expectedSend * maxMultiplier)) {
                return {
                    ruleId: 'stellar-path-strict-receive-clamp',
                    ruleName: 'Stellar PathPaymentStrictReceive Clamp',
                    severity: 'high',
                    verdict: Verdict.BLOCK,
                    reason: `sendMax budget (${sendMax}) exceeds safety buffer (${maxMultiplier}x of expected ${expectedSend}). Excessive cost overrun risk.`,
                    detectedPattern: `SEND_MAX_EXCEEDS_BUFFER:${sendMax}>${(expectedSend * maxMultiplier).toFixed(2)}`,
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=stellar_path_strict_receive.js.map