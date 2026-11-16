/**
 * AWS Access Key and Secret Key Detector & Redactor.
 * Detects, redacts, and blocks AWS Access Key IDs (AKIA, ASIA, etc.),
 * Secret Access Keys, and STS Session Tokens across tool parameters,
 * headers, and execution environments.
 */
import { SentinelRule, ToolCallContext } from '../types.js';
export type AWSKeyType = 'AccessKeyId' | 'SecretAccessKey' | 'SessionToken' | 'AuthorizationHeader';
export interface AWSKeyMatch {
    keyType: AWSKeyType;
    rawKey: string;
    redactedKey: string;
    startIndex: number;
    endIndex: number;
    paramLocation?: string;
    prefix?: string;
}
export interface AWSScrubResult {
    hasMatches: boolean;
    scrubbedText: string;
    matches: AWSKeyMatch[];
}
export interface ScrubAWSOptions {
    replacement?: string;
    contextHint?: string;
}
export interface AWSKeyDetectorOptions {
    mode?: 'block' | 'redact';
    blockOnAccessKey?: boolean;
    blockOnSecretKey?: boolean;
    blockOnSessionToken?: boolean;
    replacement?: string;
}
export declare const AWS_ACCESS_KEY_ID_REGEX: RegExp;
export declare const AWS_SECRET_KEY_ASSIGNMENT_REGEX: RegExp;
export declare const AWS_SECRET_KEY_STANDALONE_REGEX: RegExp;
export declare const AWS_SESSION_TOKEN_REGEX: RegExp;
export declare const AWS_AUTH_HEADER_REGEX: RegExp;
/**
 * Masks an AWS Access Key ID, preserving its 4-character prefix and 4 suffix characters.
 * e.g. "AKIAIOSFODNN7EXAMPLE" -> "AKIA***MPLE"
 */
export declare function maskAWSAccessKey(key: string): string;
/**
 * Masks an AWS Secret Access Key.
 */
export declare function maskAWSSecretKey(key: string): string;
/**
 * Detects AWS credentials in a given text string.
 */
export declare function detectAWSKeys(text: string, contextHint?: string): AWSKeyMatch[];
/**
 * Scans a string, identifies all AWS credentials, and replaces them with redacted equivalents.
 */
export declare function scrubAWSKeys(text: string, options?: ScrubAWSOptions): AWSScrubResult;
/**
 * Recursively scans tool context parameters for AWS keys.
 */
export declare function scanContextForAWSKeys(ctx: ToolCallContext): AWSKeyMatch[];
/**
 * Recursively redacts AWS credentials from parameters object.
 */
export declare function redactAWSKeysInParams(params: Record<string, any>, options?: ScrubAWSOptions): Record<string, any>;
/**
 * Creates an AgentSentinel security rule to block or redact AWS credentials.
 */
export declare function createAWSKeyDetectorRule(options?: AWSKeyDetectorOptions): SentinelRule;
export declare const awsKeyDetectorRule: SentinelRule;
//# sourceMappingURL=aws_key_detector.d.ts.map