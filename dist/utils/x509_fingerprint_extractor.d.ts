/**
 * AgentSentinel - X.509 Certificate Fingerprint Extractor Utility
 * Calculates and matches SHA-256 certificate fingerprints for TLS pinning.
 */
export declare class X509FingerprintExtractor {
    static extractSha256(certData: string | Uint8Array, formatted?: boolean): string;
    static matches(certData: string | Uint8Array, pinnedFingerprint: string): boolean;
}
//# sourceMappingURL=x509_fingerprint_extractor.d.ts.map