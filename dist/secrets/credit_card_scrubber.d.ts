/**
 * Credit Card Number (PAN) Validator & Scrubber (Luhn Algorithm / Mod 10).
 * Detects, validates with Luhn algorithm, masks (PCI-DSS compliant), and blocks
 * exposed payment card numbers (Visa, MasterCard, Amex, Discover, etc.) and CVVs
 * across tool parameters, prompts, and execution environments.
 */
import { SentinelRule, ToolCallContext } from '../types.js';
export type CardBrand = 'Visa' | 'MasterCard' | 'AmericanExpress' | 'Discover' | 'DinersClub' | 'JCB' | 'Unknown';
export interface CreditCardMatch {
    brand: CardBrand;
    rawNumber: string;
    normalizedNumber: string;
    redactedNumber: string;
    startIndex: number;
    endIndex: number;
    paramLocation?: string;
    hasValidLuhn: boolean;
}
export interface CreditCardScrubResult {
    hasMatches: boolean;
    scrubbedText: string;
    matches: CreditCardMatch[];
}
export interface ScrubCardOptions {
    replacement?: string;
    maskFormat?: 'pci_dss' | 'last4' | 'token';
}
export interface CreditCardRuleOptions {
    mode?: 'block' | 'redact';
    replacement?: string;
    requireLuhn?: boolean;
}
/**
 * Validates a number string using the Luhn Mod-10 algorithm.
 */
export declare function isValidLuhn(digits: string): boolean;
/**
 * Identifies the card brand based on IIN/BIN prefix rules.
 */
export declare function identifyCardBrand(digits: string): CardBrand;
export declare const CREDIT_CARD_CANDIDATE_REGEX: RegExp;
export declare const CVV_REGEX: RegExp;
/**
 * Masks a credit card number according to PCI-DSS standards.
 * Retains BIN (first 6) and last 4, masking middle digits.
 */
export declare function maskCreditCard(raw: string, format?: 'pci_dss' | 'last4' | 'token'): string;
/**
 * Detects credit card numbers in text and filters with the Luhn algorithm.
 */
export declare function detectCreditCards(text: string, requireLuhn?: boolean): CreditCardMatch[];
/**
 * Scans a string, identifies valid credit cards and CVVs, and replaces them with redacted versions.
 */
export declare function scrubCreditCards(text: string, options?: ScrubCardOptions): CreditCardScrubResult;
/**
 * Recursively scans tool context parameters for credit cards.
 */
export declare function scanContextForCreditCards(ctx: ToolCallContext, requireLuhn?: boolean): CreditCardMatch[];
/**
 * Recursively redacts credit cards from parameters object.
 */
export declare function redactCreditCardsInParams(params: Record<string, any>, options?: ScrubCardOptions): Record<string, any>;
/**
 * Creates an AgentSentinel security rule to block or redact payment card numbers.
 */
export declare function createCreditCardScrubberRule(options?: CreditCardRuleOptions): SentinelRule;
export declare const creditCardScrubberRule: SentinelRule;
//# sourceMappingURL=credit_card_scrubber.d.ts.map