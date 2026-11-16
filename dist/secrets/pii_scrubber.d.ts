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
import { SentinelRule, ToolCallContext } from '../types.js';
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
/**
 * Validates a number string using the Verhoeff checksum algorithm.
 */
export declare function validateVerhoeff(numStr: string): boolean;
/**
 * Generates the Verhoeff checksum digit for a string of digits.
 */
export declare function generateVerhoeff(numStr: string): number;
/**
 * Validates US Social Security Number format and structural rules.
 */
export declare function isValidSSN(str: string): boolean;
/**
 * Validates Indian Aadhaar format (12 digits, starting 2-9, with optional Verhoeff).
 */
export declare function isValidAadhaar(str: string, requireVerhoeff?: boolean): boolean;
/**
 * Masks an SSN: preserves only last 4 digits (***-**-1234).
 */
export declare function maskSSN(ssn: string): string;
/**
 * Masks an Aadhaar card: preserves only last 4 digits (XXXX-XXXX-1234).
 */
export declare function maskAadhaar(aadhaar: string): string;
export declare const SSN_FORMATTED_REGEX: RegExp;
export declare const AADHAAR_FORMATTED_REGEX: RegExp;
/**
 * Detects SSN and Aadhaar numbers in text.
 */
export declare function detectPII(text: string, contextHint?: string): PIIMatch[];
/**
 * Scans a string, identifies SSN and Aadhaar numbers, and replaces them with redacted equivalents.
 */
export declare function scrubPII(text: string, options?: ScrubPIIOptions): PIIScrubResult;
/**
 * Recursively scans tool context parameters for PII.
 */
export declare function scanContextForPII(ctx: ToolCallContext): PIIMatch[];
/**
 * Recursively redacts PII from parameters object.
 */
export declare function redactPIIInParams(params: Record<string, any>, options?: ScrubPIIOptions): Record<string, any>;
/**
 * Creates an AgentSentinel security rule to block or redact SSN and Aadhaar card PII.
 */
export declare function createPIIScrubberRule(options?: PIIRuleOptions): SentinelRule;
export declare const piiScrubberRule: SentinelRule;
//# sourceMappingURL=pii_scrubber.d.ts.map