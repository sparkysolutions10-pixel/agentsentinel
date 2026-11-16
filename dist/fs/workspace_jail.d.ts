/**
 * Allowed Workspace Directory Jail Validator.
 * Confines all filesystem read, write, edit, and delete operations strictly
 * within specified allowed workspace root boundaries across POSIX and Windows.
 */
import { SentinelRule } from '../types.js';
export interface WorkspaceJailInspection {
    isAllowed: boolean;
    resolvedPath: string;
    matchingRoot?: string;
    reason?: string;
}
/**
 * Normalizes a path string for cross-platform comparison.
 * Standardizes separators to `/`, resolves drive letter casing on Windows,
 * and strips trailing slashes.
 */
export declare function normalizeJailPath(p: string): string;
/**
 * Checks whether targetPath resolves strictly within one of the allowed roots.
 */
export declare function isInsideWorkspaceJail(targetPath: string, allowedRoots: string[], baseDir?: string): boolean;
/**
 * Inspects a target path against the allowed workspace roots.
 */
export declare function inspectWorkspaceJail(targetPath: string, allowedRoots: string[], baseDir?: string): WorkspaceJailInspection;
export interface WorkspaceJailGuardOptions {
    allowedRoots: string[];
    defaultBaseDir?: string;
    pathFields?: string[];
}
/**
 * Creates SentinelRule to enforce workspace directory jail.
 */
export declare function createWorkspaceJailGuardRule(options: WorkspaceJailGuardOptions): SentinelRule;
export declare const defaultWorkspaceJailGuardRule: SentinelRule;
//# sourceMappingURL=workspace_jail.d.ts.map