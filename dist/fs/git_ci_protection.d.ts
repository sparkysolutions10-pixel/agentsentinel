/**
 * Git Internals and CI/CD Configuration Tamper Protection Guard.
 * Blocks unauthorized write, edit, delete, or append tool operations
 * targeting `.git/hooks`, `.git/config`, `.github/workflows`, and CI runner scripts.
 */
import { SentinelRule } from '../types.js';
export type GitCICategory = 'git_hooks' | 'git_internals' | 'github_workflows' | 'ci_configuration';
export interface GitCIProtectionInspection {
    isProtected: boolean;
    category?: GitCICategory;
    matchedEntity?: string;
    reason?: string;
}
/**
 * Normalizes path and checks whether target is a protected Git or CI/CD resource.
 */
export declare function isProtectedGitOrCIPath(pathStr: string): boolean;
/**
 * Detailed inspection of Git/CI protection targets.
 */
export declare function inspectGitCIPath(pathStr: string): GitCIProtectionInspection;
export interface GitCIProtectionOptions {
    pathFields?: string[];
    blockAllOperations?: boolean;
}
/**
 * Creates SentinelRule to guard .git hooks and CI configurations against unauthorized modifications.
 */
export declare function createGitCIProtectionRule(options?: GitCIProtectionOptions): SentinelRule;
export declare const gitCIProtectionRule: SentinelRule;
//# sourceMappingURL=git_ci_protection.d.ts.map