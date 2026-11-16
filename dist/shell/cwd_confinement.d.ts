/**
 * Shell Working Directory Path Confinement Guard.
 * Restricts shell execution working directory (`cwd`) to designated workspace roots,
 * blocking traversal escapes (`../`), root system directories, and unauthorized drives.
 */
import { SentinelRule } from '../types.js';
export interface CwdConfinementOptions {
    allowedRoots?: string[];
    cwdFieldNames?: string[];
    blockUnspecifiedCwd?: boolean;
    defaultFallbackRoot?: string;
}
export interface CwdValidationResult {
    allowed: boolean;
    normalizedPath?: string;
    matchedRoot?: string;
    reason?: string;
}
export declare const DEFAULT_CWD_FIELDS: string[];
/**
 * Normalizes a path cleanly across Windows and POSIX boundaries.
 */
export declare function normalizePathCanonical(p: string): string;
/**
 * Checks whether candidatePath is strictly located inside or identical to rootPath.
 */
export declare function isPathInsideRoot(candidatePath: string, rootPath: string): boolean;
/**
 * Validates a working directory path against a list of allowed workspace roots.
 */
export declare function validateWorkingDir(candidateCwd: string, allowedRoots: string[]): CwdValidationResult;
/**
 * Creates the standard SentinelRule to confine shell execution cwd.
 */
export declare function createCwdConfinementRule(options?: CwdConfinementOptions): SentinelRule;
export declare const cwdConfinementRule: SentinelRule;
//# sourceMappingURL=cwd_confinement.d.ts.map