/**
 * Private Cryptographic Key PEM Block Detector & Guard.
 * Detects, redacts, and blocks exposed private cryptographic keys in PEM/PKCS format
 * across tool parameters, file contents, and execution environments.
 *
 * Covers:
 * - PKCS#1 RSA Private Keys (BEGIN RSA PRIVATE KEY)
 * - PKCS#8 Unencrypted Private Keys (BEGIN PRIVATE KEY)
 * - PKCS#8 Encrypted Private Keys (BEGIN ENCRYPTED PRIVATE KEY)
 * - SEC1 EC Private Keys (BEGIN EC PRIVATE KEY)
 * - DSA Private Keys (BEGIN DSA PRIVATE KEY)
 * - OpenSSH Private Keys (BEGIN OPENSSH PRIVATE KEY)
 * - PGP Private Key Blocks (BEGIN PGP PRIVATE KEY BLOCK)
 * - Handles both standard multiline newlines (\n) and JSON-escaped newlines (\\n).
 */
import { SentinelRule, ToolCallContext } from '../types.js';
export type PEMKeyType = 'RSA_PRIVATE' | 'PKCS8_PRIVATE' | 'ENCRYPTED_PRIVATE' | 'EC_PRIVATE' | 'DSA_PRIVATE' | 'OPENSSH_PRIVATE' | 'PGP_PRIVATE';
export interface PEMBlockMatch {
    keyType: PEMKeyType;
    header: string;
    footer: string;
    rawBlock: string;
    redactedBlock: string;
    startIndex: number;
    endIndex: number;
    paramLocation?: string;
    isEncrypted: boolean;
}
export interface PEMScrubResult {
    hasMatches: boolean;
    scrubbedText: string;
    matches: PEMBlockMatch[];
}
export interface ScrubPEMOptions {
    replacement?: string;
}
export interface PEMKeyRuleOptions {
    mode?: 'block' | 'redact';
    replacement?: string;
    blockEncrypted?: boolean;
}
/**
 * Masks a private PEM block, preserving standard headers but redacting the base64 payload.
 */
export declare function maskPEMBlock(header: string, footer: string): string;
/**
 * Detects private PEM blocks in text (supports normal and escaped newlines).
 */
export declare function detectPEMBlocks(text: string): PEMBlockMatch[];
/**
 * Scans a string, identifies all private PEM blocks, and replaces them with redacted equivalents.
 */
export declare function scrubPEMBlocks(text: string, options?: ScrubPEMOptions): PEMScrubResult;
/**
 * Recursively scans tool context parameters for private PEM blocks.
 */
export declare function scanContextForPEMBlocks(ctx: ToolCallContext): PEMBlockMatch[];
/**
 * Recursively redacts private PEM blocks from parameters object.
 */
export declare function redactPEMBlocksInParams(params: Record<string, any>, options?: ScrubPEMOptions): Record<string, any>;
/**
 * Creates an AgentSentinel security rule to block or redact private PEM key blocks.
 */
export declare function createPEMKeyDetectorRule(options?: PEMKeyRuleOptions): SentinelRule;
export declare const pemKeyDetectorRule: SentinelRule;
//# sourceMappingURL=pem_key_detector.d.ts.map