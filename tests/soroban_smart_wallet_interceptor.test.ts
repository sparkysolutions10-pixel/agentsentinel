import { describe, it, expect } from 'vitest';
import { createSorobanSmartWalletInterceptorRule } from '../src/web3/soroban_smart_wallet_interceptor.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Smart Wallet Passkey Auth Interceptor (#905, #906)', () => {
  const rule = createSorobanSmartWalletInterceptorRule({
    allowedOrigins: ['https://app.agentsentinel.io', 'https://wallet.stellar.org'],
    requireWebAuthnClientData: true,
  });

  it('allows valid Passkey WebAuthn smart wallet authentication payload (#906)', () => {
    const ctx: ToolCallContext = {
      id: 'smart-wallet-ok-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        function: '__check_auth',
        authPayload: {
          clientDataJSON: 'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0In0=',
          signature: 'sig_passkey_webauthn_abc123',
          origin: 'https://app.agentsentinel.io',
        },
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).toBeNull();
  });

  it('blocks smart wallet auth missing WebAuthn signature or clientDataJSON', () => {
    const ctx: ToolCallContext = {
      id: 'smart-wallet-missing-payload-1',
      toolName: 'soroban_invoke',
      params: {
        function: '__check_auth',
        authPayload: {},
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('missing required WebAuthn Passkey signature');
  });

  it('blocks smart wallet auth from unapproved origin domains', () => {
    const ctx: ToolCallContext = {
      id: 'smart-wallet-bad-origin-1',
      toolName: 'soroban_invoke',
      params: {
        function: '__check_auth',
        authPayload: {
          clientDataJSON: '...',
          signature: '...',
          origin: 'https://phishing-site-fake.xyz',
        },
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('not in the approved origins allowlist');
  });
});
