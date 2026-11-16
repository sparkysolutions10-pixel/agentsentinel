/**
 * Command Execution Timeout Enforcement Guard.
 * Ensures every shell tool call specifies an explicit timeout parameter
 * to prevent runaway subprocesses, infinite loops, and hung execution threads.
 * Supports auto-injecting default timeout thresholds or strictly blocking unbounded calls.
 */
import { SentinelRule } from '../types.js';
export interface TimeoutGuardOptions {
    defaultTimeoutMs?: number;
    maxAllowedTimeoutMs?: number;
    strictBlocking?: boolean;
    timeoutFieldNames?: string[];
}
export interface TimeoutEnforcementResult {
    hasValidTimeout: boolean;
    detectedTimeoutMs?: number;
    injectedTimeoutMs?: number;
    cappedTimeoutMs?: number;
    fieldName?: string;
    actionTaken: 'valid' | 'injected' | 'capped' | 'missing_blocked' | 'oversized_blocked';
    reason?: string;
}
export declare const DEFAULT_TIMEOUT_FIELDS: string[];
export declare const DEFAULT_TIMEOUT_MS = 30000;
export declare const DEFAULT_MAX_TIMEOUT_MS = 300000;
/**
 * Analyzes and sanitizes tool parameters to enforce bounded execution timeouts.
 */
export declare function enforceCommandTimeout(params: Record<string, any>, options?: TimeoutGuardOptions): {
    result: TimeoutEnforcementResult;
    updatedParams: Record<string, any>;
};
/**
 * Creates the standard SentinelRule to enforce bounded command execution timeouts.
 */
export declare function createTimeoutEnforcementRule(options?: TimeoutGuardOptions): SentinelRule;
export declare const timeoutEnforcementRule: SentinelRule;
//# sourceMappingURL=timeout.d.ts.map