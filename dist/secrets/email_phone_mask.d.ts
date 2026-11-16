/**
 * Email Address and Phone Number Privacy Mask Rule.
 * Detects, redacts, and masks email addresses and telephone numbers across tool parameters,
 * prompts, and execution logs to uphold GDPR, HIPAA, and CCPA privacy standards.
 */
import { SentinelRule, ToolCallContext } from '../types.js';
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
export declare const EMAIL_REGEX: RegExp;
export declare const PHONE_REGEX: RegExp;
/**
 * Masks an email address based on configured privacy level.
 */
export declare function maskEmail(email: string, format?: 'partial' | 'domain_only' | 'token'): string;
/**
 * Masks a phone number based on configured privacy level.
 */
export declare function maskPhone(phone: string, format?: 'partial' | 'last4' | 'token'): string;
/**
 * Detects all email addresses and phone numbers in text.
 */
export declare function detectContactInfo(text: string, options?: EmailPhoneMaskOptions): ContactMatch[];
/**
 * Scans text and replaces emails and phone numbers with masked variants.
 */
export declare function scrubContactInfo(text: string, options?: EmailPhoneMaskOptions): ContactScrubResult;
/**
 * Recursively scans tool context parameters for contact info.
 */
export declare function scanContextForContactInfo(ctx: ToolCallContext, options?: EmailPhoneMaskOptions): ContactMatch[];
/**
 * Recursively redacts contact info in parameters object.
 */
export declare function redactContactInfoInParams(params: Record<string, any>, options?: EmailPhoneMaskOptions): Record<string, any>;
/**
 * Creates an AgentSentinel security rule to block or redact emails and phone numbers.
 */
export declare function createEmailPhoneMaskRule(options?: EmailPhoneMaskOptions): SentinelRule;
export declare const emailPhoneMaskRule: SentinelRule;
//# sourceMappingURL=email_phone_mask.d.ts.map