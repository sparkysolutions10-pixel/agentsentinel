/**
 * File Path Traversal Guard.
 * Intercepts directory escape attempts and relative dot-dot path traversal
 * (e.g. `../../etc/passwd`, `..\..\windows\system32`) across POSIX and Windows,
 * including URL-encoded, double-encoded, and Unicode overlong variations.
 */
import { SentinelRule } from '../types.js';
export declare const DEFAULT_FS_PATH_FIELDS: string[];
export interface PathTraversalDetection {
    hasTraversal: boolean;
    depth: number;
    rawPath: string;
    normalizedPath?: string;
    matchedPattern?: string;
    reason?: string;
}
/**
 * Normalizes Unicode homoglyphs, overlong UTF-8 bytes, and multi-pass URL encodings.
 */
export declare function normalizePathEncodings(pathStr: string): string;
/**
 * Checks whether a given string contains relative directory traversal escapes.
 */
export declare function isPathTraversal(pathStr: string): boolean;
/**
 * Detailed inspection of path traversal depth and pattern.
 */
export declare function detectPathTraversal(pathStr: string): PathTraversalDetection;
export interface PathTraversalGuardOptions {
    pathFields?: string[];
    allowRelativeSubpaths?: boolean;
}
/**
 * Creates SentinelRule to guard against file path traversal attacks.
 */
export declare function createPathTraversalGuardRule(options?: PathTraversalGuardOptions): SentinelRule;
export declare const pathTraversalGuardRule: SentinelRule;
//# sourceMappingURL=path_traversal.d.ts.map