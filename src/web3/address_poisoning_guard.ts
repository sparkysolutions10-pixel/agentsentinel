/**
 * AgentSentinel - Web3 Address Poisoning & Vanity Impersonation Guard
 * 
 * Intercepts cryptocurrency transfer / spend tool calls.
 * Detects if a destination address mimics a known safe wallet (e.g. Treasury,
 * Cold Vault, User Account) by sharing identical prefix/suffix characters
 * while differing in the middle entropy bits (classic vanity address poisoning).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface AddressPoisoningGuardConfig {
  knownSafeWallets?: string[];
  prefixMatchLength?: number; // default: 4
  suffixMatchLength?: number; // default: 4
}

export function createAddressPoisoningGuardRule(config: AddressPoisoningGuardConfig = {}): SentinelRule {
  const safeWallets = new Set(config.knownSafeWallets || []);
  const prefixLen = config.prefixMatchLength ?? 4;
  const suffixLen = config.suffixMatchLength ?? 4;

  return {
    id: 'web3-address-poisoning-guard',
    name: 'Address Poisoning & Vanity Impersonation Guard',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      // Target financial / transfer / spend / payment tools
      if (
        !tool.includes('transfer') &&
        !tool.includes('pay') &&
        !tool.includes('spend') &&
        !tool.includes('stellar') &&
        !tool.includes('soroban') &&
        !tool.includes('send') &&
        !tool.includes('pipeline')
      ) {
        return null;
      }

      const params = (context.params || {}) as Record<string, unknown>;
      const target = (params.destination || params.recipient || params.to || params.targetAddress || '') as string;
      if (!target || typeof target !== 'string' || target.length < 20) {
        return null;
      }

      // If target is already on the verified safe list, it is authorized
      if (safeWallets.has(target)) {
        return null;
      }

      // Check against each known safe wallet for lookalike poisoning patterns
      for (const safe of safeWallets) {
        if (safe === target) continue;

        // Check if prefix and suffix match exactly while full address differs
        const safePrefix = safe.slice(0, prefixLen);
        const safeSuffix = safe.slice(-suffixLen);
        const targetPrefix = target.slice(0, prefixLen);
        const targetSuffix = target.slice(-suffixLen);

        if (safePrefix === targetPrefix && safeSuffix === targetSuffix) {
          return {
            ruleId: 'web3-address-poisoning-guard',
            ruleName: 'Address Poisoning & Vanity Impersonation Guard',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Potential Address Poisoning detected! Destination address "${target.slice(0, 8)}...${target.slice(-6)}" mimics known wallet "${safe.slice(0, 8)}...${safe.slice(-6)}" with identical prefix/suffix.`,
            detectedPattern: `prefix=${safePrefix}, suffix=${safeSuffix}`
          };
        }
      }

      return null;
    }
  };
}
