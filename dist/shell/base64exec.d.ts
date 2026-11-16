/**
 * Base64-Encoded Shell Command Execution Detector.
 * Identifies and intercepts obfuscated command execution where base64 payloads
 * are piped into shells, evaluated, or launched via -EncodedCommand.
 * Automatically decodes and re-evaluates the payload against shell security rules.
 */
import { SentinelRule, RuleViolation } from '../types.js';
export interface Base64ExecDetectionResult {
    isBase64Exec: boolean;
    reason?: string;
    detectedPattern?: string;
    rawPayload?: string;
    decodedCommand?: string;
}
export interface Base64RuleOptions {
    nestedRules?: SentinelRule[];
}
/**
 * Safely decodes standard base64 or UTF-16LE (PowerShell) strings.
 */
export declare function safelyDecodeBase64(b64: string, isPowerShell?: boolean): string | null;
/**
 * Analyzes command line strings for base64 decode-and-execute attack vectors.
 */
export declare function detectBase64Exec(rawCommand: string): Base64ExecDetectionResult;
/**
 * Automatically decodes base64 payload and evaluates the underlying command
 * against a list of SentinelRules.
 */
export declare function decodeAndEvaluatePayload(rawCommand: string, rules?: SentinelRule[]): Promise<{
    detection: Base64ExecDetectionResult;
    innerViolation: RuleViolation | null;
}>;
/**
 * Creates the standard SentinelRule to strictly block base64-encoded shell execution vectors,
 * with optional re-evaluation of decoded inner payloads against nested rules.
 */
export declare function createBase64ExecRule(options?: Base64RuleOptions): SentinelRule;
export declare const base64ExecBlockerRule: SentinelRule;
//# sourceMappingURL=base64exec.d.ts.map