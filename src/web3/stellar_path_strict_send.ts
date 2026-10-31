/**
 * AgentSentinel - PathPaymentStrictSend Maximum Destination Slippage Clamp
 * Enforces strict destMin thresholds on Stellar and Soroban path payments
 * to guarantee destination conversion never yields less than the required minimum.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface StellarPathStrictSendConfig {
  maxAllowedSlippagePercent?: number; // default: 1.0%
}

export function createStellarPathStrictSendClampRule(config: StellarPathStrictSendConfig = {}): SentinelRule {
  const maxSlippage = config.maxAllowedSlippagePercent ?? 1.0;

  return {
    id: 'stellar-path-strict-send-clamp',
    name: 'Stellar PathPaymentStrictSend Clamp',
    category: 'custom' as ToolCategory,
    priority: 82,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('path') && !tool.includes('strict_send') && !tool.includes('payment')) {
        return null;
      }

      const params = context.params || {};
      const expectedDest = Number(params.expectedDestAmount || params.destAmount || 0);
      const destMin = Number(params.destMin || params.destinationMin || 0);

      if (destMin <= 0) {
        return {
          ruleId: 'stellar-path-strict-send-clamp',
          ruleName: 'Stellar PathPaymentStrictSend Clamp',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: 'PathPaymentStrictSend missing destMin parameter. Unbounded slippage vulnerability.',
          detectedPattern: 'PATH_PAYMENT_MISSING_DEST_MIN',
        };
      }

      if (expectedDest > 0 && destMin > 0 && expectedDest > destMin) {
        const slippage = ((expectedDest - destMin) / expectedDest) * 100;
        if (slippage > maxSlippage) {
          return {
            ruleId: 'stellar-path-strict-send-clamp',
            ruleName: 'Stellar PathPaymentStrictSend Clamp',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Path payment slippage (${slippage.toFixed(2)}%) exceeds maximum tolerance (${maxSlippage}%). Potential conversion loss.`,
            detectedPattern: `PATH_SLIPPAGE_EXCEEDED:${slippage.toFixed(2)}%>${maxSlippage}%`,
          };
        }
      }

      return null;
    }
  };
}
