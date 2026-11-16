/**
 * AgentSentinel - Webhook Alert Dispatcher
 * Constructs HMAC-SHA256 signed alert payloads for incident response webhooks
 * upon detection of critical security violations or exploit attempts.
 */
import crypto from 'crypto';
export class WebhookAlertDispatcher {
    static signPayload(payload, secretKey) {
        const body = JSON.stringify(payload);
        const hmac = crypto.createHmac('sha256', secretKey);
        hmac.update(body);
        const signature = `sha256=${hmac.digest('hex')}`;
        return { body, signature };
    }
    static verifySignature(body, signatureHeader, secretKey) {
        const hmac = crypto.createHmac('sha256', secretKey);
        hmac.update(body);
        const expected = `sha256=${hmac.digest('hex')}`;
        return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
    }
}
//# sourceMappingURL=webhook_alert_dispatcher.js.map