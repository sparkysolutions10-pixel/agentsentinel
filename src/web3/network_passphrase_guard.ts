/**
 * AgentSentinel - Stellar Network Passphrase Guard
 * Enforces strict isolation between Testnet and Mainnet network passphrases
 * to prevent staging/test autonomous bots from submitting accidental transactions to Mainnet.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export const STELLAR_MAINNET_PASSPHRASE = 'Public Global Stellar Network ; September 2015';
export const STELLAR_TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';
export const STELLAR_FUTURENET_PASSPHRASE = 'Test SDF Future Network ; October 2022';

export interface NetworkPassphraseConfig {
  allowedNetwork: 'public' | 'testnet' | 'futurenet';
}

export function createNetworkPassphraseRule(config: NetworkPassphraseConfig): SentinelRule {
  const targetPassphrase = config.allowedNetwork === 'public'
    ? STELLAR_MAINNET_PASSPHRASE
    : config.allowedNetwork === 'futurenet'
      ? STELLAR_FUTURENET_PASSPHRASE
      : STELLAR_TESTNET_PASSPHRASE;

  return {
    id: 'network-passphrase-guard',
    name: 'Stellar Network Passphrase Guard',
    category: 'custom' as ToolCategory,
    priority: 95,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('stellar') && !tool.includes('soroban') && !tool.includes('tx') && !tool.includes('submit')) {
        return null;
      }

      const params = context.params || {};
      const passphrase = String(params.networkPassphrase || params.passphrase || params.network || '').trim();

      if (!passphrase) {
        return null;
      }

      if (passphrase !== targetPassphrase) {
        return {
          ruleId: 'network-passphrase-guard',
          ruleName: 'Stellar Network Passphrase Guard',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Network passphrase mismatch: agent is configured for "${config.allowedNetwork}" (${targetPassphrase}), but transaction uses "${passphrase}". Accidental cross-network execution blocked.`,
          detectedPattern: `PASSPHRASE_MISMATCH:${passphrase}!==${targetPassphrase}`
        };
      }

      return null;
    }
  };
}
