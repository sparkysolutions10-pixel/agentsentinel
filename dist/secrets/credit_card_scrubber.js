/**
 * Credit Card Number (PAN) Validator & Scrubber (Luhn Algorithm / Mod 10).
 * Detects, validates with Luhn algorithm, masks (PCI-DSS compliant), and blocks
 * exposed payment card numbers (Visa, MasterCard, Amex, Discover, etc.) and CVVs
 * across tool parameters, prompts, and execution environments.
 */
import { Verdict } from '../types.js';
/**
 * Validates a number string using the Luhn Mod-10 algorithm.
 */
export function isValidLuhn(digits) {
    const clean = digits.replace(/\D/g, '');
    if (clean.length < 13 || clean.length > 19)
        return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
        let digit = parseInt(clean.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9)
                digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}
/**
 * Identifies the card brand based on IIN/BIN prefix rules.
 */
export function identifyCardBrand(digits) {
    const clean = digits.replace(/\D/g, '');
    if (/^4/.test(clean))
        return 'Visa';
    if (/^(?:5[1-5]|2[2-7])/.test(clean))
        return 'MasterCard';
    if (/^3[47]/.test(clean))
        return 'AmericanExpress';
    if (/^(?:6011|65|64[4-9]|622)/.test(clean))
        return 'Discover';
    if (/^3(?:0[0-5]|[68])/.test(clean))
        return 'DinersClub';
    if (/^(?:2131|1800|35)/.test(clean))
        return 'JCB';
    return 'Unknown';
}
// Regex matching candidate card sequences (13 to 19 digits with spaces or hyphens)
export const CREDIT_CARD_CANDIDATE_REGEX = /\b(?:\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{1,7}|\d{4}[-\s]?\d{6}[-\s]?\d{4,5}|\d{13,19})\b/g;
// CVV / CVC pattern (3 or 4 digits associated with security code context)
export const CVV_REGEX = /(?:cvv|cvc|cvv2|cvc2|security_?code|card_?code)\s*[:=\s]\s*['"]?(\d{3,4})['"]?/gi;
/**
 * Masks a credit card number according to PCI-DSS standards.
 * Retains BIN (first 6) and last 4, masking middle digits.
 */
export function maskCreditCard(raw, format = 'pci_dss') {
    const clean = raw.replace(/\D/g, '');
    if (format === 'token') {
        return '[REDACTED_CREDIT_CARD]';
    }
    if (format === 'last4') {
        const last4 = clean.slice(-4);
        return `****-****-****-${last4}`;
    }
    // PCI-DSS standard: First 6, asterisks for middle, last 4
    if (clean.length >= 13) {
        const first6 = clean.slice(0, 6);
        const last4 = clean.slice(-4);
        const middleCount = clean.length - 10;
        return `${first6}${'*'.repeat(middleCount)}${last4}`;
    }
    return '****-****-****-****';
}
/**
 * Detects credit card numbers in text and filters with the Luhn algorithm.
 */
export function detectCreditCards(text, requireLuhn = true) {
    if (!text || typeof text !== 'string')
        return [];
    const matches = [];
    CREDIT_CARD_CANDIDATE_REGEX.lastIndex = 0;
    let match;
    while ((match = CREDIT_CARD_CANDIDATE_REGEX.exec(text)) !== null) {
        const rawNumber = match[0];
        const normalized = rawNumber.replace(/\D/g, '');
        // Check minimum and maximum length for valid payment card numbers (13 to 19 digits)
        if (normalized.length >= 13 && normalized.length <= 19) {
            const validLuhn = isValidLuhn(normalized);
            if (!requireLuhn || validLuhn) {
                matches.push({
                    brand: identifyCardBrand(normalized),
                    rawNumber,
                    normalizedNumber: normalized,
                    redactedNumber: maskCreditCard(rawNumber, 'pci_dss'),
                    startIndex: match.index,
                    endIndex: match.index + rawNumber.length,
                    hasValidLuhn: validLuhn,
                });
            }
        }
    }
    return matches;
}
/**
 * Scans a string, identifies valid credit cards and CVVs, and replaces them with redacted versions.
 */
export function scrubCreditCards(text, options) {
    if (!text || typeof text !== 'string') {
        return { hasMatches: false, scrubbedText: text || '', matches: [] };
    }
    const matches = detectCreditCards(text, true);
    let scrubbedText = text;
    const customReplacement = options?.replacement;
    const format = options?.maskFormat ?? 'pci_dss';
    // Replace card numbers
    for (const m of matches) {
        const replacement = customReplacement ?? maskCreditCard(m.rawNumber, format);
        scrubbedText = scrubbedText.split(m.rawNumber).join(replacement);
    }
    // Also scrub CVVs
    CVV_REGEX.lastIndex = 0;
    let cvvMatch;
    while ((cvvMatch = CVV_REGEX.exec(text)) !== null) {
        const full = cvvMatch[0];
        const rawCvv = cvvMatch[1];
        if (rawCvv) {
            const replacedCVV = full.replace(rawCvv, '***');
            scrubbedText = scrubbedText.split(full).join(replacedCVV);
        }
    }
    return {
        hasMatches: matches.length > 0 || scrubbedText !== text,
        scrubbedText,
        matches,
    };
}
/**
 * Recursively scans tool context parameters for credit cards.
 */
export function scanContextForCreditCards(ctx, requireLuhn = true) {
    if (!ctx.params || typeof ctx.params !== 'object') {
        return [];
    }
    const found = [];
    function traverse(obj, path) {
        if (obj === null || obj === undefined)
            return;
        if (typeof obj === 'string') {
            const matches = detectCreditCards(obj, requireLuhn);
            for (const m of matches) {
                found.push({
                    ...m,
                    paramLocation: path,
                });
            }
        }
        else if (Array.isArray(obj)) {
            obj.forEach((item, idx) => traverse(item, `${path}[${idx}]`));
        }
        else if (typeof obj === 'object') {
            for (const [key, value] of Object.entries(obj)) {
                traverse(value, path ? `${path}.${key}` : key);
            }
        }
    }
    traverse(ctx.params, '');
    return found;
}
/**
 * Recursively redacts credit cards from parameters object.
 */
export function redactCreditCardsInParams(params, options) {
    function mutateDeep(obj) {
        if (typeof obj === 'string') {
            const scrubbed = scrubCreditCards(obj, options);
            return scrubbed.scrubbedText;
        }
        else if (Array.isArray(obj)) {
            return obj.map((item) => mutateDeep(item));
        }
        else if (obj !== null && typeof obj === 'object') {
            const res = {};
            for (const [k, v] of Object.entries(obj)) {
                res[k] = mutateDeep(v);
            }
            return res;
        }
        return obj;
    }
    return mutateDeep(params);
}
/**
 * Creates an AgentSentinel security rule to block or redact payment card numbers.
 */
export function createCreditCardScrubberRule(options = {}) {
    const { mode = 'block', replacement = '[REDACTED_CREDIT_CARD]', requireLuhn = true, } = options;
    return {
        id: 'secrets-credit-card-scrubber',
        name: 'Scrub and Block Exposed Credit Card Numbers (PAN) and CVVs',
        category: 'secrets',
        priority: 975,
        enabled: true,
        evaluate(ctx) {
            const matches = scanContextForCreditCards(ctx, requireLuhn);
            if (matches.length === 0) {
                return null;
            }
            const brands = Array.from(new Set(matches.map((m) => m.brand))).join(', ');
            const locations = matches
                .map((m) => m.paramLocation)
                .filter(Boolean)
                .join(', ');
            if (mode === 'redact') {
                return {
                    ruleId: 'secrets-credit-card-scrubber',
                    ruleName: 'Scrub and Block Exposed Credit Card Numbers (PAN) and CVVs',
                    severity: 'critical',
                    verdict: Verdict.REDACT,
                    reason: `Credit card number intercepted and redacted: ${brands}${locations ? ` in [${locations}]` : ''}`,
                    redactedParams: redactCreditCardsInParams(ctx.params, { replacement }),
                };
            }
            return {
                ruleId: 'secrets-credit-card-scrubber',
                ruleName: 'Scrub and Block Exposed Credit Card Numbers (PAN) and CVVs',
                severity: 'critical',
                verdict: Verdict.BLOCK,
                reason: `Disallowed Credit Card number (PAN) leaked in tool parameters: ${brands}${locations ? ` in [${locations}]` : ''}`,
            };
        },
    };
}
export const creditCardScrubberRule = createCreditCardScrubberRule();
//# sourceMappingURL=credit_card_scrubber.js.map