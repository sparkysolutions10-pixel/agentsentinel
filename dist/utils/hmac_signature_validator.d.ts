/**
 * AgentSentinel - HMAC Signature Validator Utility
 * Signs and verifies payload authenticity with constant-time protection.
 */
export declare class HmacSignatureValidator {
    static sign(payload: string, secret: string, algorithm?: string): string;
    static verify(payload: string, signature: string, secret: string, algorithm?: string): boolean;
}
//# sourceMappingURL=hmac_signature_validator.d.ts.map