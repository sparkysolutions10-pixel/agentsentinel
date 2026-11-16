/**
 * Web3, Ethereum, and Stellar Private Key Scrubber & Guard.
 * Detects, redacts, and blocks exposed blockchain private keys, secret seeds,
 * and wallet credentials across tool parameters, transaction calls, and environment payloads.
 *
 * Covers:
 * - Ethereum 32-byte (64 hex characters) private keys (with or without 0x prefix)
 * - Stellar Secret Seeds (56-character base32 strings starting with 'S')
 * - Bitcoin WIF private keys (51-52 base58 characters starting with 5, K, or L)
 * - Excludes public addresses (Ethereum 0x 40-hex, Stellar G... public accounts, tx hashes).
 */
import { SentinelRule, ToolCallContext } from '../types.js';
export type Web3Chain = 'Ethereum' | 'Stellar' | 'Bitcoin';
export type Web3KeyType = 'EthereumPrivateKey' | 'StellarSecretSeed' | 'BitcoinWIF';
export interface Web3KeyMatch {
    chain: Web3Chain;
    keyType: Web3KeyType;
    rawKey: string;
    redactedKey: string;
    startIndex: number;
    endIndex: number;
    paramLocation?: string;
}
export interface Web3ScrubResult {
    hasMatches: boolean;
    scrubbedText: string;
    matches: Web3KeyMatch[];
}
export interface ScrubWeb3Options {
    replacement?: string;
    contextHint?: string;
}
export interface Web3KeyRuleOptions {
    mode?: 'block' | 'redact';
    replacement?: string;
    allowPublicAddresses?: boolean;
}
export declare const STELLAR_SECRET_SEED_REGEX: RegExp;
export declare const STELLAR_PUBLIC_KEY_REGEX: RegExp;
export declare const ETHEREUM_HEX_PRIVATE_KEY_REGEX: RegExp;
export declare const ETHEREUM_KEY_ASSIGNMENT_REGEX: RegExp;
export declare const BITCOIN_WIF_REGEX: RegExp;
/**
 * Masks an Ethereum or Stellar private key.
 */
export declare function maskWeb3Key(key: string, chain: Web3Chain): string;
/**
 * Detects Web3 private keys in text.
 */
export declare function detectWeb3Keys(text: string, contextHint?: string): Web3KeyMatch[];
/**
 * Scans a string, identifies Web3 private keys, and replaces them with redacted equivalents.
 */
export declare function scrubWeb3Keys(text: string, options?: ScrubWeb3Options): Web3ScrubResult;
/**
 * Recursively scans tool context parameters for Web3 private keys.
 */
export declare function scanContextForWeb3Keys(ctx: ToolCallContext): Web3KeyMatch[];
/**
 * Recursively redacts Web3 private keys from parameters object.
 */
export declare function redactWeb3KeysInParams(params: Record<string, any>, options?: ScrubWeb3Options): Record<string, any>;
/**
 * Creates an AgentSentinel security rule to block or redact Web3 private keys.
 */
export declare function createWeb3KeyScrubberRule(options?: Web3KeyRuleOptions): SentinelRule;
export declare const web3KeyScrubberRule: SentinelRule;
//# sourceMappingURL=web3_key_scrubber.d.ts.map