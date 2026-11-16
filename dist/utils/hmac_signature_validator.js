/**
 * AgentSentinel - HMAC Signature Validator Utility
 * Signs and verifies payload authenticity with constant-time protection.
 */
import crypto from 'node:crypto';
import { ConstantTimeEquality } from './constant_time_equality.js';
export class HmacSignatureValidator {
    static sign(payload, secret, algorithm = 'sha256') {
        return crypto.createHmac(algorithm, secret).update(payload, 'utf-8').digest('hex');
    }
    static verify(payload, signature, secret, algorithm = 'sha256') {
        const expected = this.sign(payload, secret, algorithm);
        const cleanSig = signature.trim().toLowerCase();
        const cleanExpected = expected.toLowerCase();
        return ConstantTimeEquality.areEqual(cleanSig, cleanExpected);
    }
}
//# sourceMappingURL=hmac_signature_validator.js.map