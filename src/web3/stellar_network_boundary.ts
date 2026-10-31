/**
 * AgentSentinel - Stellar Network Passphrase Boundary Validator
 * Strictly isolates Public Global Stellar Network from Testnet/Futurenet environments
 * to prevent automated test agents from executing transactions on live mainnet.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface StellarNetworkBoundaryConfig {
  allowedNetworkPassphrase?: string;
  environment?: 'production' | 'test' | 'staging';
}

export const PUBNET_PASSPHRASE = 'Public Global Stellar Network ; September 2015';
export const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';
export const FUTURENET_PASSPHRASE = 'Test SDF Future Network ; October 2022';

export function createStellarNetworkPassphraseValidatorRule(config: StellarNetworkBoundaryConfig = {}): SentinelRule {
  const env = config.environment || 'test';
  const allowed = config.allowedNetworkPassphrase;

  return {
    id: 'stellar-network-passphrase-validator',
    name: 'Stellar Network Passphrase Boundary Validator',
    category: 'custom' as ToolCategory,
    priority: 95,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('stellar') && !tool.includes('soroban') && !tool.includes('tx') && !tool.includes('network')) {
        return null;
      }

      const params = context.params || {};
      const passphrase = String(params.networkPassphrase || params.passphrase || '').trim();
      if (!passphrase) {
        return null;
      }

      if (allowed && passphrase !== allowed) {
        return {
          ruleId: 'stellar-network-passphrase-validator',
          ruleName: 'Stellar Network Passphrase Boundary Validator',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Network passphrase mismatch! Configured allowed network is "${allowed}", but transaction targets "${passphrase}".`,
          detectedPattern: `NETWORK_PASSPHRASE_MISMATCH:${passphrase}!=${allowed}`,
        };
      }

      // If test or staging environment, NEVER allow Pubnet passphrase
      if ((env === 'test' || env === 'staging') && passphrase === PUBNET_PASSPHRASE) {
        return {
          ruleId: 'stellar-network-passphrase-validator',
          ruleName: 'Stellar Network Passphrase Boundary Validator',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'CRITICAL SECURITY BREACH: Test or staging environment attempted to broadcast to Public Global Stellar Network (Mainnet)! Transaction blocked.',
          detectedPattern: `MAINNET_ACCESS_IN_TEST_ENV:${env}`,
        };
      }

      return null;
    }
  };
}
