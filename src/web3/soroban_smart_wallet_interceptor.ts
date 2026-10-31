/**
 * AgentSentinel - Custom Account Contract (Smart Wallet) Signature Interceptor
 * Intercepts custom smart account authentications (__check_auth), verifying
 * Passkey / WebAuthn signature payloads and origin domain bindings.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanSmartWalletConfig {
  allowedOrigins?: string[];
  requireWebAuthnClientData?: boolean;
}

export function createSorobanSmartWalletInterceptorRule(config: SorobanSmartWalletConfig = {}): SentinelRule {
  const allowedOrigins = config.allowedOrigins ?? [];
  const requireClientData = config.requireWebAuthnClientData ?? true;

  return {
    id: 'soroban-smart-wallet-interceptor',
    name: 'Soroban Smart Wallet Auth Interceptor',
    category: 'custom' as ToolCategory,
    priority: 76,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('wallet')) {
        return null;
      }

      const params = context.params || {};
      const isCustomAuth = params.function === '__check_auth' || params.isSmartWalletAuth === true;

      if (isCustomAuth) {
        const authPayload = params.authPayload || params.webAuthn || {};
        
        // 1. Verify Passkey / WebAuthn payload presence
        if (requireClientData && !authPayload.clientDataJSON && !authPayload.signature) {
          return {
            ruleId: 'soroban-smart-wallet-interceptor',
            ruleName: 'Soroban Smart Wallet Auth Interceptor',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: 'Custom account contract authentication missing required WebAuthn Passkey signature and clientDataJSON payload.',
            detectedPattern: 'SMART_WALLET_AUTH_MISSING_PAYLOAD',
          };
        }

        // 2. Verify origin binding if specified
        if (allowedOrigins.length > 0 && authPayload.origin) {
          if (!allowedOrigins.includes(authPayload.origin)) {
            return {
              ruleId: 'soroban-smart-wallet-interceptor',
              ruleName: 'Soroban Smart Wallet Auth Interceptor',
              severity: 'high',
              verdict: Verdict.BLOCK,
              reason: `Smart wallet WebAuthn origin "${authPayload.origin}" is not in the approved origins allowlist.`,
              detectedPattern: `SMART_WALLET_UNAUTHORIZED_ORIGIN:${authPayload.origin}`,
            };
          }
        }
      }

      return null;
    }
  };
}
