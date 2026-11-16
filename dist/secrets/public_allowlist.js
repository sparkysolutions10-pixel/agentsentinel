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
// Built-in standard public key and non-sensitive identifier patterns
const SSH_PUBKEY_REGEX = /^ssh-(?:rsa|ed25519|dss)|ecdsa-sha2-nistp(?:256|384|521)\s+[A-Za-z0-9+/=]{40,}/;
const CERTIFICATE_REGEX = /-----BEGIN CERTIFICATE-----(?:[\s\S]*?)-----END CERTIFICATE-----/;
const PGP_PUBKEY_REGEX = /-----BEGIN PGP PUBLIC KEY BLOCK-----(?:[\s\S]*?)-----END PGP PUBLIC KEY BLOCK-----/;
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const STELLAR_PUBKEY_REGEX = /^G[2-7A-Z]{55}$/;
const SRI_HASH_REGEX = /^sha(?:256|384|512)-[A-Za-z0-9+/=]{43,88}$/;
const GIT_COMMIT_SHA_REGEX = /^[0-9a-f]{40}$/;
export class PublicAllowlistRegistry {
    exactSet = new Set();
    patternList = [];
    config;
    constructor(config = {}) {
        this.config = {
            allowSSHPublicKeys: config.allowSSHPublicKeys ?? true,
            allowCertificates: config.allowCertificates ?? true,
            allowPGPPublicKeys: config.allowPGPPublicKeys ?? true,
            allowBlockchainAddresses: config.allowBlockchainAddresses ?? true,
            allowSRIHashes: config.allowSRIHashes ?? true,
            allowGitCommitSHAs: config.allowGitCommitSHAs ?? true,
            customLiterals: config.customLiterals ?? [],
            customPatterns: config.customPatterns ?? [],
        };
        // Register initial custom literals
        for (const lit of this.config.customLiterals) {
            this.addExact(lit);
        }
        // Register initial custom patterns
        for (const pat of this.config.customPatterns) {
            this.addPattern(pat, 'custom_pattern');
        }
    }
    /**
     * Adds an exact literal string to the allowlist.
     */
    addExact(literal) {
        if (literal && typeof literal === 'string') {
            this.exactSet.add(literal.trim());
        }
        return this;
    }
    /**
     * Adds a regex pattern to the allowlist.
     */
    addPattern(pattern, type = 'custom_pattern') {
        if (pattern instanceof RegExp) {
            this.patternList.push({ pattern, type });
        }
        return this;
    }
    /**
     * Checks whether a candidate string is an authorized public key or allowlisted identifier.
     */
    isAllowlisted(candidate) {
        if (!candidate || typeof candidate !== 'string') {
            return { isAllowed: false };
        }
        const trimmed = candidate.trim();
        // 1. Check exact custom literals
        if (this.exactSet.has(trimmed)) {
            return {
                isAllowed: true,
                matchedType: 'custom_literal',
                matchedRule: trimmed,
            };
        }
        // 2. Check SSH public keys
        if (this.config.allowSSHPublicKeys && SSH_PUBKEY_REGEX.test(trimmed)) {
            return {
                isAllowed: true,
                matchedType: 'ssh_public_key',
                matchedRule: 'SSH Public Key Header',
            };
        }
        // 3. Check X.509 Certificates
        if (this.config.allowCertificates && CERTIFICATE_REGEX.test(trimmed)) {
            return {
                isAllowed: true,
                matchedType: 'certificate',
                matchedRule: 'X.509 Certificate Block',
            };
        }
        // 4. Check PGP public keys
        if (this.config.allowPGPPublicKeys && PGP_PUBKEY_REGEX.test(trimmed)) {
            return {
                isAllowed: true,
                matchedType: 'pgp_public_key',
                matchedRule: 'PGP Public Key Block',
            };
        }
        // 5. Check Blockchain public addresses (Ethereum 0x 40-hex, Stellar G 56-char)
        if (this.config.allowBlockchainAddresses) {
            if (ETH_ADDRESS_REGEX.test(trimmed)) {
                return {
                    isAllowed: true,
                    matchedType: 'blockchain_address',
                    matchedRule: 'Ethereum 20-byte Public Address',
                };
            }
            if (STELLAR_PUBKEY_REGEX.test(trimmed)) {
                return {
                    isAllowed: true,
                    matchedType: 'blockchain_address',
                    matchedRule: 'Stellar Public Account ID',
                };
            }
        }
        // 6. Check SRI hashes
        if (this.config.allowSRIHashes && SRI_HASH_REGEX.test(trimmed)) {
            return {
                isAllowed: true,
                matchedType: 'sri_hash',
                matchedRule: 'Subresource Integrity (SRI) Hash',
            };
        }
        // 7. Check Git Commit SHAs
        if (this.config.allowGitCommitSHAs && GIT_COMMIT_SHA_REGEX.test(trimmed)) {
            return {
                isAllowed: true,
                matchedType: 'git_commit_sha',
                matchedRule: 'Git 40-Hex Commit SHA',
            };
        }
        // 8. Check registered custom patterns
        for (const { pattern, type } of this.patternList) {
            pattern.lastIndex = 0;
            if (pattern.test(trimmed)) {
                return {
                    isAllowed: true,
                    matchedType: type,
                    matchedRule: pattern.toString(),
                };
            }
        }
        return { isAllowed: false };
    }
    /**
     * Filters a list of candidates, returning only items that are NOT allowlisted.
     */
    filterSensitive(candidates) {
        return candidates.filter((c) => !this.isAllowlisted(c).isAllowed);
    }
}
/**
 * Global default instance of the Public Allowlist Registry.
 */
export const defaultPublicAllowlist = new PublicAllowlistRegistry();
//# sourceMappingURL=public_allowlist.js.map