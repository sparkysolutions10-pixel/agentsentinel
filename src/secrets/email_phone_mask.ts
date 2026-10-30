/**
 * Email Address and Phone Number Privacy Mask Rule.
 * Detects, redacts, and masks email addresses and telephone numbers across tool parameters,
 * prompts, and execution logs to uphold GDPR, HIPAA, and CCPA privacy standards.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export type ContactType = 'Email' | 'Phone';

export interface ContactMatch {
  type: ContactType;
  raw: string;
  masked: string;
  startIndex: number;
  endIndex: number;
  paramLocation?: string;
}

export interface ContactScrubResult {
  hasMatches: boolean;
  scrubbedText: string;
  matches: ContactMatch[];
}

export interface EmailPhoneMaskOptions {
  mode?: 'block' | 'redact';
  maskEmail?: boolean;
  maskPhone?: boolean;
  emailFormat?: 'partial' | 'domain_only' | 'token';
  phoneFormat?: 'partial' | 'last4' | 'token';
  customEmailReplacement?: string;
  customPhoneReplacement?: string;
}

// Standard RFC 5322 simplified email regex
export const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// International and domestic phone number pattern (covers E.164, US/Canada, India, UK formats)
export const PHONE_REGEX =
  /(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}\b/g;

// IPv4 pattern to avoid false matches on IP addresses
const IP_V4_REGEX = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;

/**
 * Masks an email address based on configured privacy level.
 */
export function maskEmail(email: string, format: 'partial' | 'domain_only' | 'token' = 'partial'): string {
  if (!email || !email.includes('@')) return '***@***.***';

  if (format === 'token') {
    return '[REDACTED_EMAIL]';
  }

  const [username, domain] = email.split('@');

  if (format === 'domain_only') {
    return `***@${domain}`;
  }

  // partial: preserve first character and last character if long enough
  if (username.length <= 2) {
    return `${username.charAt(0)}***@${domain}`;
  }

  const firstChar = username.charAt(0);
  const lastChar = username.charAt(username.length - 1);
  return `${firstChar}***${lastChar}@${domain}`;
}

/**
 * Masks a phone number based on configured privacy level.
 */
export function maskPhone(phone: string, format: 'partial' | 'last4' | 'token' = 'partial'): string {
  if (!phone) return '***-***-****';

  if (format === 'token') {
    return '[REDACTED_PHONE]';
  }

  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';

  const last4 = digits.slice(-4);

  if (format === 'last4') {
    return `***-***-${last4}`;
  }

  // partial: preserve country code if present with '+'
  if (phone.trim().startsWith('+')) {
    const plusPrefix = phone.trim().slice(0, 3);
    return `${plusPrefix} ***-***-${last4}`;
  }

  return `***-***-${last4}`;
}

/**
 * Detects all email addresses and phone numbers in text.
 */
export function detectContactInfo(text: string, options: EmailPhoneMaskOptions = {}): ContactMatch[] {
  if (!text || typeof text !== 'string') return [];

  const {
    maskEmail: checkEmail = true,
    maskPhone: checkPhone = true,
    emailFormat = 'partial',
    phoneFormat = 'partial',
    customEmailReplacement,
    customPhoneReplacement,
  } = options;

  const matches: ContactMatch[] = [];

  // Find all IP address ranges to avoid false positive phone matches
  const ipRanges: Array<{ start: number; end: number }> = [];
  IP_V4_REGEX.lastIndex = 0;
  let ipMatch: RegExpExecArray | null;
  while ((ipMatch = IP_V4_REGEX.exec(text)) !== null) {
    ipRanges.push({ start: ipMatch.index, end: ipMatch.index + ipMatch[0].length });
  }

  // 1. Detect emails
  if (checkEmail) {
    EMAIL_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = EMAIL_REGEX.exec(text)) !== null) {
      const raw = match[0];
      const masked = customEmailReplacement ?? maskEmail(raw, emailFormat);
      matches.push({
        type: 'Email',
        raw,
        masked,
        startIndex: match.index,
        endIndex: match.index + raw.length,
      });
    }
  }

  // 2. Detect phone numbers (only if checkPhone is enabled)
  if (checkPhone) {
    PHONE_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = PHONE_REGEX.exec(text)) !== null) {
      const raw = match[0];
      const digitsOnly = raw.replace(/\D/g, '');
      const start = match.index;
      const end = start + raw.length;

      // Avoid matching if inside an email address
      const isInsideEmail = matches.some((m) => m.type === 'Email' && start >= m.startIndex && start < m.endIndex);
      // Avoid matching if inside an IPv4 address
      const isInsideIp = ipRanges.some((ip) => start >= ip.start && start < ip.end);

      if (!isInsideEmail && !isInsideIp && digitsOnly.length >= 7 && digitsOnly.length <= 15) {
        const masked = customPhoneReplacement ?? maskPhone(raw, phoneFormat);
        matches.push({
          type: 'Phone',
          raw,
          masked,
          startIndex: start,
          endIndex: end,
        });
      }
    }
  }

  return matches.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Scans text and replaces emails and phone numbers with masked variants.
 */
export function scrubContactInfo(text: string, options: EmailPhoneMaskOptions = {}): ContactScrubResult {
  if (!text || typeof text !== 'string') {
    return { hasMatches: false, scrubbedText: text || '', matches: [] };
  }

  const matches = detectContactInfo(text, options);
  if (matches.length === 0) {
    return { hasMatches: false, scrubbedText: text, matches: [] };
  }

  let scrubbedText = text;
  for (const m of matches) {
    scrubbedText = scrubbedText.split(m.raw).join(m.masked);
  }

  return {
    hasMatches: true,
    scrubbedText,
    matches,
  };
}

/**
 * Recursively scans tool context parameters for contact info.
 */
export function scanContextForContactInfo(ctx: ToolCallContext, options: EmailPhoneMaskOptions = {}): ContactMatch[] {
  if (!ctx.params || typeof ctx.params !== 'object') {
    return [];
  }

  const found: ContactMatch[] = [];

  function traverse(obj: unknown, path: string): void {
    if (obj === null || obj === undefined) return;

    if (typeof obj === 'string') {
      const matches = detectContactInfo(obj, options);
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
 * Recursively redacts contact info in parameters object.
 */
export function redactContactInfoInParams(
  params: Record<string, any>,
  options: EmailPhoneMaskOptions = {}
): Record<string, any> {
  function mutateDeep(obj: unknown): unknown {
    if (typeof obj === 'string') {
      const scrubbed = scrubContactInfo(obj, options);
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
 * Creates an AgentSentinel security rule to block or redact emails and phone numbers.
 */
export function createEmailPhoneMaskRule(options: EmailPhoneMaskOptions = {}): SentinelRule {
  const {
    mode = 'redact',
    maskEmail = true,
    maskPhone = true,
  } = options;

  return {
    id: 'secrets-email-phone-mask',
    name: 'Scrub and Mask Exposed Email Addresses and Phone Numbers',
    category: 'secrets',
    priority: 965,
    enabled: true,

    evaluate(ctx: ToolCallContext): RuleViolation | null {
      const matches = scanContextForContactInfo(ctx, options);

      if (matches.length === 0) {
        return null;
      }

      const types = Array.from(new Set(matches.map((m) => m.type))).join(', ');
      const locations = matches
        .map((m) => m.paramLocation)
        .filter(Boolean)
        .join(', ');

      if (mode === 'redact') {
        return {
          ruleId: 'secrets-email-phone-mask',
          ruleName: 'Scrub and Mask Exposed Email Addresses and Phone Numbers',
          severity: 'medium',
          verdict: Verdict.REDACT,
          reason: `Contact privacy mask applied: ${types}${locations ? ` in [${locations}]` : ''}`,
          redactedParams: redactContactInfoInParams(ctx.params, options),
        };
      }

      return {
        ruleId: 'secrets-email-phone-mask',
        ruleName: 'Scrub and Mask Exposed Email Addresses and Phone Numbers',
        severity: 'medium',
        verdict: Verdict.BLOCK,
        reason: `Disallowed personal contact info exposed in tool parameters: ${types}${locations ? ` in [${locations}]` : ''}`,
      };
    },
  };
}

export const emailPhoneMaskRule: SentinelRule = createEmailPhoneMaskRule();
