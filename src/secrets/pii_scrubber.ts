/**
 * Personally Identifiable Information (PII) Scrubber: SSN & Aadhaar Card.
 * Detects, validates, masks, and blocks exposed US Social Security Numbers (SSN)
 * and Indian Aadhaar numbers across tool parameters, prompts, and execution logs.
 *
 * Implements:
 * - US SSN validation (Area: not 000, 666, 900-999; Group: not 00; Serial: not 0000)
 * - Indian Aadhaar 12-digit validation (Starts 2-9, optional Verhoeff Mod-10 checksum)
 * - Safe masking (SSN: ***-**-1234; Aadhaar: XXXX-XXXX-1234)
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export type PIIType = 'US_SSN' | 'IN_AADHAAR';

export interface PIIMatch {
  piiType: PIIType;
  raw: string;
  normalized: string;
  redacted: string;
  startIndex: number;
  endIndex: number;
  paramLocation?: string;
  isValidChecksum: boolean;
}

export interface PIIScrubResult {
  hasMatches: boolean;
  scrubbedText: string;
  matches: PIIMatch[];
}

export interface ScrubPIIOptions {
  replacement?: string;
}

export interface PIIRuleOptions {
  mode?: 'block' | 'redact';
  replacement?: string;
  blockSSN?: boolean;
  blockAadhaar?: boolean;
}

// Verhoeff algorithm lookup tables for Aadhaar checksum validation
const VERHOEFF_D: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const VERHOEFF_P: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const VERHOEFF_INV: number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates a number string using the Verhoeff checksum algorithm.
 */
export function validateVerhoeff(numStr: string): boolean {
  const digits = numStr.replace(/\D/g, '');
  if (!digits) return false;

  let c = 0;
  const len = digits.length;

  for (let i = 0; i < len; i++) {
    const digit = parseInt(digits.charAt(len - 1 - i), 10);
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digit]];
  }

  return c === 0;
}

/**
 * Generates the Verhoeff checksum digit for a string of digits.
 */
export function generateVerhoeff(numStr: string): number {
  const digits = numStr.replace(/\D/g, '');
  let c = 0;
  const len = digits.length;

  for (let i = 0; i < len; i++) {
    const digit = parseInt(digits.charAt(len - 1 - i), 10);
    c = VERHOEFF_D[c][VERHOEFF_P[(i + 1) % 8][digit]];
  }

  return VERHOEFF_INV[c];
}

/**
 * Validates US Social Security Number format and structural rules.
 */
export function isValidSSN(str: string): boolean {
  const clean = str.replace(/\D/g, '');
  if (clean.length !== 9) return false;

  const area = parseInt(clean.slice(0, 3), 10);
  const group = parseInt(clean.slice(3, 5), 10);
  const serial = parseInt(clean.slice(5, 9), 10);

  // Area: cannot be 000, 666, or 900-999
  if (area === 0 || area === 666 || area >= 900) return false;
  // Group: cannot be 00
  if (group === 0) return false;
  // Serial: cannot be 0000
  if (serial === 0) return false;

  return true;
}

/**
 * Validates Indian Aadhaar format (12 digits, starting 2-9, with optional Verhoeff).
 */
export function isValidAadhaar(str: string, requireVerhoeff: boolean = false): boolean {
  const clean = str.replace(/\D/g, '');
  if (clean.length !== 12) return false;

  // Aadhaar numbers never start with 0 or 1
  const firstDigit = parseInt(clean.charAt(0), 10);
  if (firstDigit < 2 || firstDigit > 9) return false;

  if (requireVerhoeff) {
    return validateVerhoeff(clean);
  }

  return true;
}

/**
 * Masks an SSN: preserves only last 4 digits (***-**-1234).
 */
export function maskSSN(ssn: string): string {
  const clean = ssn.replace(/\D/g, '');
  if (clean.length >= 4) {
    return `***-**-${clean.slice(-4)}`;
  }
  return '***-**-****';
}

/**
 * Masks an Aadhaar card: preserves only last 4 digits (XXXX-XXXX-1234).
 */
export function maskAadhaar(aadhaar: string): string {
  const clean = aadhaar.replace(/\D/g, '');
  if (clean.length >= 4) {
    return `XXXX-XXXX-${clean.slice(-4)}`;
  }
  return 'XXXX-XXXX-XXXX';
}

// US SSN standard formatted regex: 3 digits, separator, 2 digits, separator, 4 digits
export const SSN_FORMATTED_REGEX = /\b(?!000|666|9\d{2})\d{3}[-\s](?!00)\d{2}[-\s](?!0000)\d{4}\b/g;

// Indian Aadhaar formatted regex: 3 groups of 4 digits, starting 2-9
export const AADHAAR_FORMATTED_REGEX = /\b[2-9]\d{3}[-\s]\d{4}[-\s]\d{4}\b/g;

// Contextual keywords indicating SSN or Aadhaar for unformatted 9 or 12 digit numbers
const SSN_CONTEXT_REGEX = /(?:ssn|social_?security|tax_?id|tin|national_?id)/i;
const AADHAAR_CONTEXT_REGEX = /(?:aadhaar|aadhar|uidai|unique_?id)/i;

/**
 * Detects SSN and Aadhaar numbers in text.
 */
export function detectPII(text: string, contextHint?: string): PIIMatch[] {
  if (!text || typeof text !== 'string') return [];

  const matches: PIIMatch[] = [];

  // Helper to add match
  function addMatch(piiType: PIIType, raw: string, index: number, isValidChecksum: boolean): void {
    if (!matches.some((m) => m.startIndex === index && m.raw === raw)) {
      const normalized = raw.replace(/\D/g, '');
      const redacted = piiType === 'US_SSN' ? maskSSN(raw) : maskAadhaar(raw);

      matches.push({
        piiType,
        raw,
        normalized,
        redacted,
        startIndex: index,
        endIndex: index + raw.length,
        isValidChecksum,
      });
    }
  }

  // 1. Formatted US SSNs
  SSN_FORMATTED_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SSN_FORMATTED_REGEX.exec(text)) !== null) {
    if (isValidSSN(match[0])) {
      addMatch('US_SSN', match[0], match.index, true);
    }
  }

  // 2. Formatted Indian Aadhaar
  AADHAAR_FORMATTED_REGEX.lastIndex = 0;
  while ((match = AADHAAR_FORMATTED_REGEX.exec(text)) !== null) {
    const rawAadhaar = match[0];
    const isVerhoeff = validateVerhoeff(rawAadhaar);
    addMatch('IN_AADHAAR', rawAadhaar, match.index, isVerhoeff);
  }

  // 3. Unformatted contextual checks (if contextHint indicates SSN or Aadhaar)
  if (contextHint) {
    if (SSN_CONTEXT_REGEX.test(contextHint)) {
      const unformattedMatch = text.match(/\b\d{9}\b/);
      if (unformattedMatch && unformattedMatch.index !== undefined && isValidSSN(unformattedMatch[0])) {
        addMatch('US_SSN', unformattedMatch[0], unformattedMatch.index, true);
      }
    }
    if (AADHAAR_CONTEXT_REGEX.test(contextHint)) {
      const unformattedMatch = text.match(/\b[2-9]\d{11}\b/);
      if (unformattedMatch && unformattedMatch.index !== undefined) {
        const isVerhoeff = validateVerhoeff(unformattedMatch[0]);
        addMatch('IN_AADHAAR', unformattedMatch[0], unformattedMatch.index, isVerhoeff);
      }
    }
  }

  return matches;
}

/**
 * Scans a string, identifies SSN and Aadhaar numbers, and replaces them with redacted equivalents.
 */
export function scrubPII(text: string, options?: ScrubPIIOptions): PIIScrubResult {
  if (!text || typeof text !== 'string') {
    return { hasMatches: false, scrubbedText: text || '', matches: [] };
  }

  const matches = detectPII(text);
  if (matches.length === 0) {
    return { hasMatches: false, scrubbedText: text, matches: [] };
  }

  let scrubbedText = text;
  const customReplacement = options?.replacement;

  for (const m of matches) {
    const replacement = customReplacement ?? m.redacted;
    scrubbedText = scrubbedText.split(m.raw).join(replacement);
  }

  return {
    hasMatches: true,
    scrubbedText,
    matches,
  };
}

/**
 * Recursively scans tool context parameters for PII.
 */
export function scanContextForPII(ctx: ToolCallContext): PIIMatch[] {
  if (!ctx.params || typeof ctx.params !== 'object') {
    return [];
  }

  const found: PIIMatch[] = [];

  function traverse(obj: unknown, path: string): void {
    if (obj === null || obj === undefined) return;

    if (typeof obj === 'string') {
      const matches = detectPII(obj, path);
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
 * Recursively redacts PII from parameters object.
 */
export function redactPIIInParams(
  params: Record<string, any>,
  options?: ScrubPIIOptions
): Record<string, any> {
  function mutateDeep(obj: unknown, path: string): unknown {
    if (typeof obj === 'string') {
      const matches = detectPII(obj, path);
      if (matches.length === 0) return obj;
      let res = obj;
      for (const m of matches) {
        const replacement = options?.replacement ?? m.redacted;
        res = res.split(m.raw).join(replacement);
      }
      return res;
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
 * Creates an AgentSentinel security rule to block or redact SSN and Aadhaar card PII.
 */
export function createPIIScrubberRule(options: PIIRuleOptions = {}): SentinelRule {
  const {
    mode = 'block',
    replacement,
    blockSSN = true,
    blockAadhaar = true,
  } = options;

  return {
    id: 'secrets-pii-scrubber',
    name: 'Scrub and Block Exposed SSN and Aadhaar Card PII',
    category: 'secrets',
    priority: 970,
    enabled: true,

    evaluate(ctx: ToolCallContext): RuleViolation | null {
      const matches = scanContextForPII(ctx);

      if (matches.length === 0) {
        return null;
      }

      const activeMatches = matches.filter((m) => {
        if (m.piiType === 'US_SSN' && blockSSN) return true;
        if (m.piiType === 'IN_AADHAAR' && blockAadhaar) return true;
        return false;
      });

      if (activeMatches.length === 0) {
        return null;
      }

      const types = Array.from(new Set(activeMatches.map((m) => m.piiType))).join(', ');
      const locations = activeMatches
        .map((m) => m.paramLocation)
        .filter(Boolean)
        .join(', ');

      if (mode === 'redact') {
        return {
          ruleId: 'secrets-pii-scrubber',
          ruleName: 'Scrub and Block Exposed SSN and Aadhaar Card PII',
          severity: 'high',
          verdict: Verdict.REDACT,
          reason: `PII intercepted and redacted: ${types}${locations ? ` in [${locations}]` : ''}`,
          redactedParams: redactPIIInParams(ctx.params, { replacement }),
        };
      }

      return {
        ruleId: 'secrets-pii-scrubber',
        ruleName: 'Scrub and Block Exposed SSN and Aadhaar Card PII',
        severity: 'high',
        verdict: Verdict.BLOCK,
        reason: `Disallowed Personally Identifiable Information (PII) leaked in tool parameters: ${types}${locations ? ` in [${locations}]` : ''}`,
      };
    },
  };
}

export const piiScrubberRule: SentinelRule = createPIIScrubberRule();
