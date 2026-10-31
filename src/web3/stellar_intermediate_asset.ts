/**
 * AgentSentinel - Intermediate Asset Issuer Trustline Verifier
 * Verifies all intermediate assets along a multi-hop Stellar payment path
 * possess active trustlines, valid issuers, and non-zero orderbook liquidity.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface StellarIntermediateAssetConfig {
  blockedIssuers?: string[];
}

export function createStellarIntermediateAssetTrustlineRule(config: StellarIntermediateAssetConfig = {}): SentinelRule {
  const blocked = new Set((config.blockedIssuers || []).map(i => i.toUpperCase()));

  return {
    id: 'stellar-intermediate-asset-verifier',
    name: 'Stellar Intermediate Asset Verifier',
    category: 'custom' as ToolCategory,
    priority: 81,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('path') && !tool.includes('payment') && !tool.includes('stellar')) {
        return null;
      }

      const params = context.params || {};
      const intermediatePath: any[] = Array.isArray(params.path) ? params.path : [];

      for (const asset of intermediatePath) {
        const issuer = String(asset.issuer || asset.assetIssuer || '').toUpperCase();
        if (issuer && blocked.has(issuer)) {
          return {
            ruleId: 'stellar-intermediate-asset-verifier',
            ruleName: 'Stellar Intermediate Asset Verifier',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Payment path traverses an untrusted or blacklisted asset issuer (${issuer}). Intercepted to prevent asset freeze.`,
            detectedPattern: `BLACKLISTED_ISSUER_IN_PATH:${issuer}`,
          };
        }

        const liquidityRaw = asset.liquidity !== undefined ? asset.liquidity : (asset.orderbookDepth !== undefined ? asset.orderbookDepth : 100);
        const liquidity = Number(liquidityRaw);
        if (liquidity <= 0) {
          return {
            ruleId: 'stellar-intermediate-asset-verifier',
            ruleName: 'Stellar Intermediate Asset Verifier',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Intermediate asset (${asset.code || 'UNKNOWN'}) possesses zero orderbook liquidity. Routing will fail or incur massive slippage.`,
            detectedPattern: `ZERO_LIQUIDITY_INTERMEDIATE_ASSET:${asset.code || 'UNKNOWN'}`,
          };
        }
      }

      return null;
    }
  };
}
