/**
 * AgentSentinel - X.509 Certificate Fingerprint Extractor Utility
 * Calculates and matches SHA-256 certificate fingerprints for TLS pinning.
 */
import crypto from 'node:crypto';
import { ConstantTimeEquality } from './constant_time_equality.js';
export class X509FingerprintExtractor {
    static extractSha256(certData, formatted = true) {
        let buf;
        if (typeof certData === 'string') {
            const cleanPem = certData
                .replace(/-----BEGIN CERTIFICATE-----/g, '')
                .replace(/-----END CERTIFICATE-----/g, '')
                .replace(/\s+/g, '');
            buf = Buffer.from(cleanPem, 'base64');
        }
        else {
            buf = Buffer.from(certData);
        }
        const hex = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
        if (!formatted)
            return hex;
        const parts = [];
        for (let i = 0; i < hex.length; i += 2) {
            parts.push(hex.substring(i, i + 2));
        }
        return parts.join(':');
    }
    static matches(certData, pinnedFingerprint) {
        const rawActual = this.extractSha256(certData, false);
        const rawPinned = pinnedFingerprint.replace(/[:\s-]/g, '').toUpperCase();
        return ConstantTimeEquality.areEqual(rawActual, rawPinned);
    }
}
//# sourceMappingURL=x509_fingerprint_extractor.js.map