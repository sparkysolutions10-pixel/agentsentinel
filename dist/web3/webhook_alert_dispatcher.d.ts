/**
 * AgentSentinel - Webhook Alert Dispatcher
 * Constructs HMAC-SHA256 signed alert payloads for incident response webhooks
 * upon detection of critical security violations or exploit attempts.
 */
import { RuleViolation, ToolCallContext } from '../types.js';
export interface WebhookAlertPayload {
    alertId: string;
    timestamp: number;
    toolCall: ToolCallContext;
    violations: RuleViolation[];
}
export declare class WebhookAlertDispatcher {
    static signPayload(payload: WebhookAlertPayload, secretKey: string): {
        body: string;
        signature: string;
    };
    static verifySignature(body: string, signatureHeader: string, secretKey: string): boolean;
}
//# sourceMappingURL=webhook_alert_dispatcher.d.ts.map