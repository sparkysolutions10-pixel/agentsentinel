/**
 * AgentSentinel - Zero-Address and Burn Address Transfer Interceptor
 * Intercepts and blocks accidental asset transfers directed to zero-addresses or known burn destinations
 * on Soroban contracts and Stellar accounts.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanZeroAddressConfig {
  allowedExplicitBurnMethods?: string[];
}

const KNOWN_BURN_ADDRESSES = new Set([
  'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', // Stellar 32-byte zero pubkey
  '0x0000000000000000000000000000000000000000',
  '0x000000000000000000000000000000000000dead',
  '0000000000000000000000000000000000000000000000000000000000000000',
]);

export function createSorobanZeroAddressBurnInterceptorRule(config: SorobanZeroAddressConfig = {}): SentinelRule {
  const allowedBurnMethods = new Set((config.allowedExplicitBurnMethods || ['burn', 'token_burn']).map(m => m.toLowerCase()));

  return {
    id: 'soroban-zero-address-interceptor',
    name: 'Soroban Zero & Burn Address Interceptor',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('transfer') && !tool.includes('send') && !tool.includes('payment') && !tool.includes('soroban') && !tool.includes('stellar')) {
        return null;
      }

      // If intentionally invoking an approved burn method, allow
      if (allowedBurnMethods.has(tool) || (context.params && allowedBurnMethods.has(String(context.params.method || '').toLowerCase()))) {
        return null;
      }

      const params = context.params || {};
      const recipient = String(params.to || params.recipient || params.destination || params.target || '').trim();
      if (!recipient) {
        return null;
      }

      const isZero = KNOWN_BURN_ADDRESSES.has(recipient) ||
        /^0x0+$/i.test(recipient) ||
        /^G0+$/i.test(recipient) ||
        /^0+$/.test(recipient);

      if (isZero) {
        return {
          ruleId: 'soroban-zero-address-interceptor',
          ruleName: 'Soroban Zero & Burn Address Interceptor',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Accidental token transfer targeting zero/burn destination (${recipient}) intercepted. Prevents irreversible asset destruction.`,
          detectedPattern: `BURN_DESTINATION_INTERCEPTED:${recipient}`,
        };
      }

      return null;
    }
  };
}
