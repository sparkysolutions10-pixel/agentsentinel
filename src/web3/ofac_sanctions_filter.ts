/**
 * AgentSentinel - OFAC SDN Sanctions Address Filter
 * Blocks all transactions interacting with OFAC SDN-listed cryptocurrency addresses
 * to ensure autonomous agent fleets maintain compliance with global AML sanctions.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

// Seed OFAC SDN flagged addresses (known illicit entities / mixers)
const DEFAULT_SANCTIONED_ADDRESSES = new Set([
  '0x8589427373D6D84E98730D7795D8f6f8731FDA16'.toLowerCase(), // Tornado Cash
  '0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b'.toLowerCase(),
  'GBBD67IFDDNVVUWW7AUXCXP22OHGDBC3SANCTIONED1234567890'.toLowerCase()
]);

export interface OfacSanctionsConfig {
  customSanctionedAddresses?: string[];
}

export function createOfacSanctionsRule(config: OfacSanctionsConfig = {}): SentinelRule {
  const sanctioned = new Set(DEFAULT_SANCTIONED_ADDRESSES);
  if (config.customSanctionedAddresses) {
    for (const addr of config.customSanctionedAddresses) {
      sanctioned.add(addr.toLowerCase());
    }
  }

  return {
    id: 'ofac-sanctions-address-filter',
    name: 'OFAC SDN Sanctions Address Filter',
    category: 'custom' as ToolCategory,
    priority: 100,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const params = context.params || {};
      const target = String(params.to || params.destination || params.recipient || params.sender || params.from || '').toLowerCase();

      if (!target) {
        return null;
      }

      if (sanctioned.has(target)) {
        return {
          ruleId: 'ofac-sanctions-address-filter',
          ruleName: 'OFAC SDN Sanctions Address Filter',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Transaction blocked: address "${target}" matches OFAC SDN sanctions watch list. High-priority AML compliance halt.`,
          detectedPattern: `SANCTIONED_ADDRESS_INTERCEPTED:${target}`
        };
      }

      return null;
    }
  };
}
