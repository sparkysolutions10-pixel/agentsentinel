/**
 * Sensitive System Directory and Credential File Read Blocker.
 * Intercepts unauthorized file read and access attempts targeting operating system
 * critical directories (/etc, /proc, /sys, /var/run, C:\Windows\System32) and
 * user credential stores (~/.ssh, ~/.aws, ~/.kube).
 */
import { SentinelRule } from '../types.js';
export type SensitivePathCategory = 'credentials' | 'system_config' | 'kernel_proc' | 'windows_system';
export interface SensitivePathInspection {
    isSensitive: boolean;
    category?: SensitivePathCategory;
    matchedTarget?: string;
    normalizedPath: string;
    reason?: string;
}
/**
 * Normalizes slashes and resolves path before checking against sensitive directories.
 */
export declare function normalizeSystemPath(rawPath: string): string;
/**
 * Checks whether a given path references sensitive system files or directories.
 */
export declare function isSensitiveSystemPath(pathStr: string): boolean;
/**
 * Detailed inspection of sensitive system path access.
 */
export declare function inspectSensitivePath(pathStr: string): SensitivePathInspection;
export interface SensitiveDirectoryBlockerOptions {
    pathFields?: string[];
    customBlockedPatterns?: RegExp[];
}
/**
 * Creates SentinelRule to block reads/access to sensitive operating system directories.
 */
export declare function createSensitiveDirectoryBlockerRule(options?: SensitiveDirectoryBlockerOptions): SentinelRule;
export declare const sensitiveDirectoryBlockerRule: SentinelRule;
//# sourceMappingURL=sensitive_directory_blocker.d.ts.map