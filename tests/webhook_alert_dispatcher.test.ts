import { describe, it, expect } from 'vitest';
import { WebhookAlertDispatcher } from '../src/web3/webhook_alert_dispatcher.js';
import { Verdict } from '../src/types.js';

describe('WebhookAlertDispatcher', () => {
  const secret = 'super_secret_webhook_key_12345';

  it('signs and verifies alert payloads accurately using HMAC-SHA256', () => {
    const payload = {
      alertId: 'alert_1',
      timestamp: Date.now(),
      toolCall: {
        id: 'tx_1',
        toolName: 'transfer',
        params: { to: 'GBBD...' },
        timestamp: Date.now()
      },
      violations: [
        {
          ruleId: 'soroban-token-ceiling',
          ruleName: 'Token Ceiling',
          severity: 'critical' as const,
          verdict: Verdict.BLOCK,
          reason: 'Ceiling exceeded'
        }
      ]
    };

    const { body, signature } = WebhookAlertDispatcher.signPayload(payload, secret);
    expect(signature).toContain('sha256=');

    const isValid = WebhookAlertDispatcher.verifySignature(body, signature, secret);
    expect(isValid).toBe(true);
  });
});
