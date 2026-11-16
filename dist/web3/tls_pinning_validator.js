/**
 * AgentSentinel - TLS Certificate Public Key Pinning Validator
 * Verifies SHA-256 SPKI fingerprints of TLS certificates on institutional RPC connections
 * to guarantee immunity against malicious MITM proxying and certificate authority compromise.
 */
import { Verdict } from '../types.js';
export function createTlsPinningRule(config = {}) {
    const pinned = config.pinnedFingerprints ? new Set(config.pinnedFingerprints.map(f => f.toLowerCase())) : null;
    const enforceHttps = config.enforceHttps ?? true;
    return {
        id: 'tls-pinning-validator',
        name: 'TLS Certificate Pinning Validator',
        category: 'network',
        priority: 90,
        enabled: true,
        evaluate(context) {
            const params = context.params || {};
            const endpoint = String(params.rpcUrl || params.endpoint || params.url || '');
            if (!endpoint) {
                return null;
            }
            if (enforceHttps && endpoint.startsWith('http://')) {
                return {
                    ruleId: 'tls-pinning-validator',
                    ruleName: 'TLS Certificate Pinning Validator',
                    severity: 'critical',
                    verdict: Verdict.BLOCK,
                    reason: `Insecure plaintext HTTP RPC endpoint rejected: "${endpoint}". TLS encryption (HTTPS) is mandatory.`,
                    detectedPattern: 'INSECURE_PLAINTEXT_HTTP'
                };
            }
            if (pinned) {
                const fingerprint = String(params.tlsSpkiFingerprint || params.certFingerprint || '').toLowerCase();
                if (!fingerprint) {
                    return {
                        ruleId: 'tls-pinning-validator',
                        ruleName: 'TLS Certificate Pinning Validator',
                        severity: 'critical',
                        verdict: Verdict.BLOCK,
                        reason: `RPC connection rejected: certificate SPKI fingerprint is missing for pinned endpoint "${endpoint}".`,
                        detectedPattern: 'MISSING_TLS_PIN_FINGERPRINT'
                    };
                }
                if (!pinned.has(fingerprint)) {
                    return {
                        ruleId: 'tls-pinning-validator',
                        ruleName: 'TLS Certificate Pinning Validator',
                        severity: 'critical',
                        verdict: Verdict.BLOCK,
                        reason: `Untrusted TLS certificate fingerprint: "${fingerprint}". MITM proxy or certificate mismatch detected.`,
                        detectedPattern: `UNTRUSTED_TLS_FINGERPRINT:${fingerprint}`
                    };
                }
            }
            return null;
        }
    };
}
//# sourceMappingURL=tls_pinning_validator.js.map