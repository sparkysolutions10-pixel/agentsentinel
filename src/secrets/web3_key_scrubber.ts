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

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

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

// Stellar Secret Seed: Starts with 'S', base32 alphabet (2-7, A-Z), exactly 56 characters
export const STELLAR_SECRET_SEED_REGEX = /\bS[2-7A-Z]{55}\b/g;

// Stellar Public Account ID: Starts with 'G', 56 characters (DO NOT REDACT)
export const STELLAR_PUBLIC_KEY_REGEX = /\bG[2-7A-Z]{55}\b/g;

// Ethereum Private Key with 0x prefix (64 hex chars)
export const ETHEREUM_HEX_PRIVATE_KEY_REGEX = /\b0x[a-fA-F0-9]{64}\b/g;

// Ethereum Private Key assignment or context pattern
export const ETHEREUM_KEY_ASSIGNMENT_REGEX =
  /(?:private_?key|priv_?key|signer_?key|wallet_?secret|eth_?private_?key|secret_?key|ETH_PRIVATE_KEY|PRIVATE_KEY)\s*[:=\s]\s*['"]?(?:0x)?([a-fA-F0-9]{64})['"]?/gi;

// Bitcoin WIF Private Key: 51-52 characters starting with 5, K, or L
export const BITCOIN_WIF_REGEX = /\b[5KL][1-9A-HJ-NP-Za-km-z]{50,51}\b/g;

/**
 * Checks if a context string or key name suggests a public transaction hash rather than a private key.
 */
function isPublicHashContext(contextHint?: string): boolean {
  if (!contextHint) return false;
  return /(?:tx_?hash|transaction_?hash|block_?hash|receipt|txid|tx_id|filter_id|state_root)/i.test(contextHint);
}

/**
 * Checks if a context string explicitly suggests a private key.
 */
function isExplicitPrivateKeyContext(contextHint?: string): boolean {
  if (!contextHint) return false;
  return /(?:private_?key|priv_?key|signer|secret|seed|wallet_?key|credential|auth_?key|mnemonic)/i.test(contextHint);
}

/**
 * Masks an Ethereum or Stellar private key.
 */
export function maskWeb3Key(key: string, chain: Web3Chain): string {
  if (!key || key.length < 8) return 'web3_***';

  if (chain === 'Stellar') {
    return 'S***' + key.slice(-4);
  }

  if (chain === 'Ethereum') {
    const has0x = key.startsWith('0x') || key.startsWith('0X');
    const prefix = has0x ? '0x***' : '***';
    return prefix + key.slice(-4);
  }

  return 'btc_wif_***' + key.slice(-4);
}

/**
 * Detects Web3 private keys in text.
 */
export function detectWeb3Keys(text: string, contextHint?: string): Web3KeyMatch[] {
  if (!text || typeof text !== 'string') return [];

  const matches: Web3KeyMatch[] = [];

  // 1. Detect Stellar Secret Seeds (starts with S, 56 chars)
  STELLAR_SECRET_SEED_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = STELLAR_SECRET_SEED_REGEX.exec(text)) !== null) {
    const rawKey = match[0];
    matches.push({
      chain: 'Stellar',
      keyType: 'StellarSecretSeed',
      rawKey,
      redactedKey: maskWeb3Key(rawKey, 'Stellar'),
      startIndex: match.index,
      endIndex: match.index + rawKey.length,
    });
  }

  // 2. Detect Bitcoin WIF keys
  BITCOIN_WIF_REGEX.lastIndex = 0;
  while ((match = BITCOIN_WIF_REGEX.exec(text)) !== null) {
    const rawKey = match[0];
    matches.push({
      chain: 'Bitcoin',
      keyType: 'BitcoinWIF',
      rawKey,
      redactedKey: maskWeb3Key(rawKey, 'Bitcoin'),
      startIndex: match.index,
      endIndex: match.index + rawKey.length,
    });
  }

  // 3. Detect Ethereum 64-hex Private Keys
  // Check assignments / flag formats
  ETHEREUM_KEY_ASSIGNMENT_REGEX.lastIndex = 0;
  while ((match = ETHEREUM_KEY_ASSIGNMENT_REGEX.exec(text)) !== null) {
    const rawKey = match[1];
    const fullMatch = match[0];
    if (rawKey) {
      const keyIndex = match.index + fullMatch.indexOf(rawKey);
      if (!matches.some((m) => m.rawKey.includes(rawKey))) {
        matches.push({
          chain: 'Ethereum',
          keyType: 'EthereumPrivateKey',
          rawKey,
          redactedKey: maskWeb3Key(rawKey, 'Ethereum'),
          startIndex: keyIndex,
          endIndex: keyIndex + rawKey.length,
        });
      }
    }
  }

  // Check 0x prefixed 64-hex keys unless context explicitly indicates txHash / blockHash
  if (!isPublicHashContext(contextHint)) {
    ETHEREUM_HEX_PRIVATE_KEY_REGEX.lastIndex = 0;
    while ((match = ETHEREUM_HEX_PRIVATE_KEY_REGEX.exec(text)) !== null) {
      const rawKey = match[0];
      // If explicit private key context or not explicitly marked as txHash
      if (isExplicitPrivateKeyContext(contextHint) || !contextHint) {
        if (!matches.some((m) => m.startIndex === match!.index)) {
          matches.push({
            chain: 'Ethereum',
            keyType: 'EthereumPrivateKey',
            rawKey,
            redactedKey: maskWeb3Key(rawKey, 'Ethereum'),
            startIndex: match.index,
            endIndex: match.index + rawKey.length,
          });
        }
      }
    }
  }

  // Standalone 64-hex if contextHint explicitly states private_key
  if (isExplicitPrivateKeyContext(contextHint)) {
    const rawTrimmed = text.trim();
    if (/^[a-fA-F0-9]{64}$/.test(rawTrimmed)) {
      if (!matches.some((m) => m.rawKey === rawTrimmed)) {
        matches.push({
          chain: 'Ethereum',
          keyType: 'EthereumPrivateKey',
          rawKey: rawTrimmed,
          redactedKey: maskWeb3Key(rawTrimmed, 'Ethereum'),
          startIndex: 0,
          endIndex: rawTrimmed.length,
        });
      }
    }
  }

  return matches;
}

/**
 * Scans a string, identifies Web3 private keys, and replaces them with redacted equivalents.
 */
export function scrubWeb3Keys(text: string, options?: ScrubWeb3Options): Web3ScrubResult {
  if (!text || typeof text !== 'string') {
    return { hasMatches: false, scrubbedText: text || '', matches: [] };
  }

  const matches = detectWeb3Keys(text, options?.contextHint);
  if (matches.length === 0) {
    return { hasMatches: false, scrubbedText: text, matches: [] };
  }

  let scrubbedText = text;
  const customReplacement = options?.replacement;

  for (const m of matches) {
    const replacement = customReplacement ?? m.redactedKey;
    scrubbedText = scrubbedText.split(m.rawKey).join(replacement);
  }

  return {
    hasMatches: true,
    scrubbedText,
    matches,
  };
}

/**
 * Recursively scans tool context parameters for Web3 private keys.
 */
export function scanContextForWeb3Keys(ctx: ToolCallContext): Web3KeyMatch[] {
  if (!ctx.params || typeof ctx.params !== 'object') {
    return [];
  }

  const found: Web3KeyMatch[] = [];

  function traverse(obj: unknown, path: string): void {
    if (obj === null || obj === undefined) return;

    if (typeof obj === 'string') {
      const matches = detectWeb3Keys(obj, path);
      for (const m of matches) {
        found.push({
          ...m,
          paramLocation: path,
        });
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, idx) => traverse(item, `${path}[${idx}]`));
    } else if (typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        traverse(value, path ? `${path}.${key}` : key);
      }
    }
  }

  traverse(ctx.params, '');
  return found;
}

/**
 * Recursively redacts Web3 private keys from parameters object.
 */
export function redactWeb3KeysInParams(
  params: Record<string, any>,
  options?: ScrubWeb3Options
): Record<string, any> {
  function mutateDeep(obj: unknown, path: string): unknown {
    if (typeof obj === 'string') {
      const scrubbed = scrubWeb3Keys(obj, { ...options, contextHint: path });
      return scrubbed.scrubbedText;
    } else if (Array.isArray(obj)) {
      return obj.map((item, idx) => mutateDeep(item, `${path}[${idx}]`));
    } else if (obj !== null && typeof obj === 'object') {
      const res: Record<string, any> = {};
      for (const [k, v] of Object.entries(obj)) {
        res[k] = mutateDeep(v, path ? `${path}.${k}` : k);
      }
      return res;
    }
    return obj;
  }

  return mutateDeep(params, '') as Record<string, any>;
}

/**
 * Creates an AgentSentinel security rule to block or redact Web3 private keys.
 */
export function createWeb3KeyScrubberRule(options: Web3KeyRuleOptions = {}): SentinelRule {
  const {
    mode = 'block',
    replacement = '[REDACTED_WEB3_KEY]',
  } = options;

  return {
    id: 'secrets-web3-private-key-scrubber',
    name: 'Scrub and Block Leaked Ethereum and Stellar Private Keys',
    category: 'secrets',
    priority: 985,
    enabled: true,

    evaluate(ctx: ToolCallContext): RuleViolation | null {
      const matches = scanContextForWeb3Keys(ctx);

      if (matches.length === 0) {
        return null;
      }

      const chains = Array.from(new Set(matches.map((m) => m.chain))).join(', ');
      const locations = matches
        .map((m) => m.paramLocation)
        .filter(Boolean)
        .join(', ');

      if (mode === 'redact') {
        return {
          ruleId: 'secrets-web3-private-key-scrubber',
          ruleName: 'Scrub and Block Leaked Ethereum and Stellar Private Keys',
          severity: 'critical',
          verdict: Verdict.REDACT,
          reason: `Web3 private key intercepted and redacted: ${chains}${locations ? ` in [${locations}]` : ''}`,
          redactedParams: redactWeb3KeysInParams(ctx.params, { replacement }),
        };
      }

      return {
        ruleId: 'secrets-web3-private-key-scrubber',
        ruleName: 'Scrub and Block Leaked Ethereum and Stellar Private Keys',
        severity: 'critical',
        verdict: Verdict.BLOCK,
        reason: `Disallowed Web3 private key leaked in tool parameters: ${chains}${locations ? ` in [${locations}]` : ''}`,
      };
    },
  };
}

export const web3KeyScrubberRule: SentinelRule = createWeb3KeyScrubberRule();
