/**
 * AgentSentinel - Decentralized Exchange Maximum Slippage Enforcer
 * Enforces strict slippage tolerance (default 0.5%) on Soroban AMM swap transactions
 * to shield autonomous AI agents from MEV sandwiching and excessive price impact.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanSlippageConfig {
  maxSlippagePercent?: number; // default: 0.5%
}

export function createSorobanSlippageEnforcerRule(config: SorobanSlippageConfig = {}): SentinelRule {
  const maxSlippage = config.maxSlippagePercent ?? 0.5;

  return {
    id: 'soroban-slippage-enforcer',
    name: 'Soroban DEX Slippage Enforcer',
    category: 'custom' as ToolCategory,
    priority: 70,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('swap') && !tool.includes('dex')) {
        return null;
      }

      const params = context.params || {};
      const expectedOut = Number(params.expectedAmountOut || params.expectedOutput || params.quotedOut || 0);
      const minOut = Number(params.minAmountOut || params.minimumReceived || params.minOut || 0);

      if (expectedOut > 0 && minOut > 0 && expectedOut > minOut) {
        const slippagePercent = ((expectedOut - minOut) / expectedOut) * 100;
        if (slippagePercent > maxSlippage) {
          return {
            ruleId: 'soroban-slippage-enforcer',
            ruleName: 'Soroban DEX Slippage Enforcer',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Swap slippage tolerance (${slippagePercent.toFixed(2)}%) exceeds maximum allowed safety threshold (${maxSlippage}%). Potential MEV extractable value risk.`,
            detectedPattern: `SLIPPAGE_EXCEEDED:${slippagePercent.toFixed(2)}%>${maxSlippage}%`,
          };
        }
      }

      return null;
    }
  };
}
