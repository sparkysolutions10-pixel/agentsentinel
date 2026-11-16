/**
 * AgentSentinel - Stellar Fee Bump Transaction Guard
 * Clamps maximum base fee surges on FeeBumpTransaction operations
 * to prevent runaway bidding wars and gas drain during network congestion.
 */
import { Verdict } from '../types.js';
export function createTransactionFeeBumpingRule(config = {}) {
    const maxBaseFee = config.maxBaseFeeStroops ?? 5000;
    const maxTotalFee = config.maxTotalFeeStroops ?? 50000;
    return {
        id: 'transaction-fee-bumping-guard',
        name: 'Stellar Transaction Fee Bumping Guard',
        category: 'custom',
        priority: 85,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('feebump') && !tool.includes('bump_fee') && !tool.includes('fee_bump')) {
                return null;
            }
            const params = context.params || {};
            const baseFee = Number(params.baseFee ?? params.fee ?? params.maxFee ?? 0);
            if (baseFee > maxBaseFee) {
                return {
                    ruleId: 'transaction-fee-bumping-guard',
                    ruleName: 'Stellar Transaction Fee Bumping Guard',
                    severity: 'high',
                    verdict: Verdict.BLOCK,
                    reason: `Fee bumping surge ceiling exceeded: requested base fee (${baseFee} stroops) exceeds safety clamp (${maxBaseFee} stroops). Bidding war halted.`,
                    detectedPattern: `EXCESSIVE_FEE_BUMP:${baseFee}>${maxBaseFee}`
                };
            }
            const totalFee = Number(params.totalFee ?? baseFee);
            if (totalFee > maxTotalFee) {
                return {
                    ruleId: 'transaction-fee-bumping-guard',
                    ruleName: 'Stellar Transaction Fee Bumping Guard',
                    severity: 'high',
                    verdict: Verdict.BLOCK,
                    reason: `Total fee-bump expenditure (${totalFee} stroops) exceeds safe maximum allowance (${maxTotalFee} stroops).`,
                    detectedPattern: `TOTAL_FEE_BUMP_EXCEEDED:${totalFee}>${maxTotalFee}`
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=transaction_fee_bumping_guard.js.map