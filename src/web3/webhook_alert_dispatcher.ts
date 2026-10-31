/**
 * AgentSentinel - Webhook Alert Dispatcher
 * Constructs HMAC-SHA256 signed alert payloads for incident response webhooks
 * upon detection of critical security violations or exploit attempts.
 */

import crypto from 'crypto';
import { RuleViolation, ToolCallContext } from '../types.js';

export interface WebhookAlertPayload {
  alertId: string;
  timestamp: number;
  toolCall: ToolCallContext;
  violations: RuleViolation[];
}

export class WebhookAlertDispatcher {
  public static signPayload(payload: WebhookAlertPayload, secretKey: string): { body: string; signature: string } {
    const body = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(body);
    const signature = `sha256=${hmac.digest('hex')}`;
    return { body, signature };
  }

  public static verifySignature(body: string, signatureHeader: string, secretKey: string): boolean {
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(body);
    const expected = `sha256=${hmac.digest('hex')}`;
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
  }
}
