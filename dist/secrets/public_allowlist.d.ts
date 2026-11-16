/**
 * Public Key and Non-Sensitive Identifier Allowlist Registry.
 * Preserves legitimate public keys, certificates, blockchain addresses, and public hashes
 * without falsely triggering high-entropy secret detectors or secret scrubbers.
 *
 * Built-in default exemptions:
 * - SSH Public Keys (ssh-rsa, ssh-ed25519, ecdsa-sha2-nistp256)
 * - X.509 Public Certificates (-----BEGIN CERTIFICATE-----)
 * - PGP Public Key Blocks (-----BEGIN PGP PUBLIC KEY BLOCK-----)
 * - Ethereum public addresses (0x + 40 hex chars)
 * - Stellar public accounts (G + 55 base32 chars)
 * - Subresource Integrity (SRI) hashes (sha256-, sha384-, sha512-)
 * - Git Commit SHAs (40 hex characters)
 */
export type AllowlistEntryType = 'ssh_public_key' | 'pgp_public_key' | 'certificate' | 'blockchain_address' | 'sri_hash' | 'git_commit_sha' | 'custom_literal' | 'custom_pattern';
export interface AllowlistCheckResult {
    isAllowed: boolean;
    matchedType?: AllowlistEntryType;
    matchedRule?: string;
}
export interface AllowlistConfig {
    allowSSHPublicKeys?: boolean;
    allowCertificates?: boolean;
    allowPGPPublicKeys?: boolean;
    allowBlockchainAddresses?: boolean;
    allowSRIHashes?: boolean;
    allowGitCommitSHAs?: boolean;
    customLiterals?: string[];
    customPatterns?: RegExp[];
}
export declare class PublicAllowlistRegistry {
    private exactSet;
    private patternList;
    private config;
    constructor(config?: AllowlistConfig);
    /**
     * Adds an exact literal string to the allowlist.
     */
    addExact(literal: string): this;
    /**
     * Adds a regex pattern to the allowlist.
     */
    addPattern(pattern: RegExp, type?: AllowlistEntryType): this;
    /**
     * Checks whether a candidate string is an authorized public key or allowlisted identifier.
     */
    isAllowlisted(candidate: string): AllowlistCheckResult;
    /**
     * Filters a list of candidates, returning only items that are NOT allowlisted.
     */
    filterSensitive(candidates: string[]): string[];
}
/**
 * Global default instance of the Public Allowlist Registry.
 */
export declare const defaultPublicAllowlist: PublicAllowlistRegistry;
//# sourceMappingURL=public_allowlist.d.ts.map