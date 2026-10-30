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

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export type PEMKeyType =
  | 'RSA_PRIVATE'
  | 'PKCS8_PRIVATE'
  | 'ENCRYPTED_PRIVATE'
  | 'EC_PRIVATE'
  | 'DSA_PRIVATE'
  | 'OPENSSH_PRIVATE'
  | 'PGP_PRIVATE';

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

interface PEMPatternDefinition {
  keyType: PEMKeyType;
  headerText: string;
  footerText: string;
  pattern: RegExp;
  isEncrypted: boolean;
}

const PEM_DEFINITIONS: PEMPatternDefinition[] = [
  {
    keyType: 'RSA_PRIVATE',
    headerText: '-----BEGIN RSA PRIVATE KEY-----',
    footerText: '-----END RSA PRIVATE KEY-----',
    pattern: /-----BEGIN RSA PRIVATE KEY-----(?:[\s\S]*?)-----END RSA PRIVATE KEY-----/g,
    isEncrypted: false,
  },
  {
    keyType: 'ENCRYPTED_PRIVATE',
    headerText: '-----BEGIN ENCRYPTED PRIVATE KEY-----',
    footerText: '-----END ENCRYPTED PRIVATE KEY-----',
    pattern: /-----BEGIN ENCRYPTED PRIVATE KEY-----(?:[\s\S]*?)-----END ENCRYPTED PRIVATE KEY-----/g,
    isEncrypted: true,
  },
  {
    keyType: 'PKCS8_PRIVATE',
    headerText: '-----BEGIN PRIVATE KEY-----',
    footerText: '-----END PRIVATE KEY-----',
    pattern: /-----BEGIN PRIVATE KEY-----(?:[\s\S]*?)-----END PRIVATE KEY-----/g,
    isEncrypted: false,
  },
  {
    keyType: 'EC_PRIVATE',
    headerText: '-----BEGIN EC PRIVATE KEY-----',
    footerText: '-----END EC PRIVATE KEY-----',
    pattern: /-----BEGIN EC PRIVATE KEY-----(?:[\s\S]*?)-----END EC PRIVATE KEY-----/g,
    isEncrypted: false,
  },
  {
    keyType: 'DSA_PRIVATE',
    headerText: '-----BEGIN DSA PRIVATE KEY-----',
    footerText: '-----END DSA PRIVATE KEY-----',
    pattern: /-----BEGIN DSA PRIVATE KEY-----(?:[\s\S]*?)-----END DSA PRIVATE KEY-----/g,
    isEncrypted: false,
  },
  {
    keyType: 'OPENSSH_PRIVATE',
    headerText: '-----BEGIN OPENSSH PRIVATE KEY-----',
    footerText: '-----END OPENSSH PRIVATE KEY-----',
    pattern: /-----BEGIN OPENSSH PRIVATE KEY-----(?:[\s\S]*?)-----END OPENSSH PRIVATE KEY-----/g,
    isEncrypted: false,
  },
  {
    keyType: 'PGP_PRIVATE',
    headerText: '-----BEGIN PGP PRIVATE KEY BLOCK-----',
    footerText: '-----END PGP PRIVATE KEY BLOCK-----',
    pattern: /-----BEGIN PGP PRIVATE KEY BLOCK-----(?:[\s\S]*?)-----END PGP PRIVATE KEY BLOCK-----/g,
    isEncrypted: false,
  },
];

/**
 * Masks a private PEM block, preserving standard headers but redacting the base64 payload.
 */
export function maskPEMBlock(header: string, footer: string): string {
  return `${header}\n[REDACTED_PRIVATE_KEY_BODY]\n${footer}`;
}

/**
 * Detects private PEM blocks in text (supports normal and escaped newlines).
 */
export function detectPEMBlocks(text: string): PEMBlockMatch[] {
  if (!text || typeof text !== 'string') return [];

  const matches: PEMBlockMatch[] = [];

  for (const def of PEM_DEFINITIONS) {
    def.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = def.pattern.exec(text)) !== null) {
      const rawBlock = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + rawBlock.length;

      // Avoid overlapping duplicates
      if (!matches.some((m) => m.startIndex <= startIndex && m.endIndex >= endIndex)) {
        matches.push({
          keyType: def.keyType,
          header: def.headerText,
          footer: def.footerText,
          rawBlock,
          redactedBlock: maskPEMBlock(def.headerText, def.footerText),
          startIndex,
          endIndex,
          isEncrypted: def.isEncrypted,
        });
      }
    }
  }

  return matches.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Scans a string, identifies all private PEM blocks, and replaces them with redacted equivalents.
 */
export function scrubPEMBlocks(text: string, options?: ScrubPEMOptions): PEMScrubResult {
  if (!text || typeof text !== 'string') {
    return { hasMatches: false, scrubbedText: text || '', matches: [] };
  }

  const matches = detectPEMBlocks(text);
  if (matches.length === 0) {
    return { hasMatches: false, scrubbedText: text, matches: [] };
  }

  let scrubbedText = text;
  const customReplacement = options?.replacement;

  for (const m of matches) {
    const replacement = customReplacement ?? m.redactedBlock;
    scrubbedText = scrubbedText.split(m.rawBlock).join(replacement);
  }

  return {
    hasMatches: true,
    scrubbedText,
    matches,
  };
}

/**
 * Recursively scans tool context parameters for private PEM blocks.
 */
export function scanContextForPEMBlocks(ctx: ToolCallContext): PEMBlockMatch[] {
  if (!ctx.params || typeof ctx.params !== 'object') {
    return [];
  }

  const found: PEMBlockMatch[] = [];

  function traverse(obj: unknown, path: string): void {
    if (obj === null || obj === undefined) return;

    if (typeof obj === 'string') {
      const matches = detectPEMBlocks(obj);
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
 * Recursively redacts private PEM blocks from parameters object.
 */
export function redactPEMBlocksInParams(
  params: Record<string, any>,
  options?: ScrubPEMOptions
): Record<string, any> {
  function mutateDeep(obj: unknown): unknown {
    if (typeof obj === 'string') {
      const scrubbed = scrubPEMBlocks(obj, options);
      return scrubbed.scrubbedText;
    } else if (Array.isArray(obj)) {
      return obj.map((item) => mutateDeep(item));
    } else if (obj !== null && typeof obj === 'object') {
      const res: Record<string, any> = {};
      for (const [k, v] of Object.entries(obj)) {
        res[k] = mutateDeep(v);
      }
      return res;
    }
    return obj;
  }

  return mutateDeep(params) as Record<string, any>;
}

/**
 * Creates an AgentSentinel security rule to block or redact private PEM key blocks.
 */
export function createPEMKeyDetectorRule(options: PEMKeyRuleOptions = {}): SentinelRule {
  const {
    mode = 'block',
    replacement = '[REDACTED_PRIVATE_KEY_BLOCK]',
    blockEncrypted = true,
  } = options;

  return {
    id: 'secrets-pem-key-detector',
    name: 'Scrub and Block Private Cryptographic Key PEM Blocks',
    category: 'secrets',
    priority: 995,
    enabled: true,

    evaluate(ctx: ToolCallContext): RuleViolation | null {
      const matches = scanContextForPEMBlocks(ctx);

      if (matches.length === 0) {
        return null;
      }

      // Filter matches based on encryption policy if specified
      const activeMatches = matches.filter((m) => blockEncrypted || !m.isEncrypted);

      if (activeMatches.length === 0) {
        return null;
      }

      const types = Array.from(new Set(activeMatches.map((m) => m.keyType))).join(', ');
      const locations = activeMatches
        .map((m) => m.paramLocation)
        .filter(Boolean)
        .join(', ');

      if (mode === 'redact') {
        return {
          ruleId: 'secrets-pem-key-detector',
          ruleName: 'Scrub and Block Private Cryptographic Key PEM Blocks',
          severity: 'critical',
          verdict: Verdict.REDACT,
          reason: `Private PEM key block intercepted and redacted: ${types}${locations ? ` in [${locations}]` : ''}`,
          redactedParams: redactPEMBlocksInParams(ctx.params, { replacement }),
        };
      }

      return {
        ruleId: 'secrets-pem-key-detector',
        ruleName: 'Scrub and Block Private Cryptographic Key PEM Blocks',
        severity: 'critical',
        verdict: Verdict.BLOCK,
        reason: `Disallowed private cryptographic key PEM block leaked in tool parameters: ${types}${locations ? ` in [${locations}]` : ''}`,
      };
    },
  };
}

export const pemKeyDetectorRule: SentinelRule = createPEMKeyDetectorRule();
