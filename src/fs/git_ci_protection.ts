/**
 * Git Internals and CI/CD Configuration Tamper Protection Guard.
 * Blocks unauthorized write, edit, delete, or append tool operations
 * targeting `.git/hooks`, `.git/config`, `.github/workflows`, and CI runner scripts.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { DEFAULT_FS_PATH_FIELDS, normalizePathEncodings } from './path_traversal.js';

export type GitCICategory =
  | 'git_hooks'
  | 'git_internals'
  | 'github_workflows'
  | 'ci_configuration';

export interface GitCIProtectionInspection {
  isProtected: boolean;
  category?: GitCICategory;
  matchedEntity?: string;
  reason?: string;
}

// Patterns for protected Git internals and CI configuration files
const GIT_CI_PATTERNS: Array<{
  pattern: RegExp;
  category: GitCICategory;
  name: string;
}> = [
  // Git hooks (highest risk for local code execution hijack)
  {
    pattern: /(?:^|[/\\])\.git[/\\]hooks(?:[/\\]|$)/i,
    category: 'git_hooks',
    name: 'Git Hook Executable (.git/hooks)',
  },
  // General git internals (HEAD, config, index, objects)
  {
    pattern: /(?:^|[/\\])\.git[/\\](?:config|HEAD|index|objects|refs)(?:[/\\]|$)/i,
    category: 'git_internals',
    name: 'Git Internal Repository Metadata (.git)',
  },
  // GitHub Actions workflow definitions
  {
    pattern: /(?:^|[/\\])\.github[/\\]workflows(?:[/\\]|$)/i,
    category: 'github_workflows',
    name: 'GitHub Actions Workflow (.github/workflows)',
  },
  // Other CI/CD configurations
  {
    pattern: /(?:^|[/\\])(?:\.gitlab-ci\.ya?ml|Jenkinsfile|\.circleci(?:[/\\]|$)|azure-pipelines\.ya?ml|bitbucket-pipelines\.ya?ml|\.travis\.ya?ml)/i,
    category: 'ci_configuration',
    name: 'CI/CD Pipeline Runner Configuration',
  },
];

const WRITE_TOOL_NAME_PATTERN = /(?:write|edit|create|delete|append|modify|overwrite|remove|unlink|save|touch|truncate|rm|patch)/i;

/**
 * Normalizes path and checks whether target is a protected Git or CI/CD resource.
 */
export function isProtectedGitOrCIPath(pathStr: string): boolean {
  return inspectGitCIPath(pathStr).isProtected;
}

/**
 * Detailed inspection of Git/CI protection targets.
 */
export function inspectGitCIPath(pathStr: string): GitCIProtectionInspection {
  if (!pathStr || typeof pathStr !== 'string') {
    return { isProtected: false };
  }

  const normalized = normalizePathEncodings(pathStr.trim());

  for (const { pattern, category, name } of GIT_CI_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isProtected: true,
        category,
        matchedEntity: name,
        reason: `Target path '${pathStr}' is a protected pipeline/repository configuration: ${name}`,
      };
    }
  }

  return { isProtected: false };
}

export interface GitCIProtectionOptions {
  pathFields?: string[];
  blockAllOperations?: boolean;
}

/**
 * Creates SentinelRule to guard .git hooks and CI configurations against unauthorized modifications.
 */
export function createGitCIProtectionRule(options?: GitCIProtectionOptions): SentinelRule {
  const pathFields = options?.pathFields || DEFAULT_FS_PATH_FIELDS;
  const blockAll = options?.blockAllOperations ?? false;

  return {
    id: 'fs-protect-git-and-ci-configs',
    name: 'Protect Git Internals and CI/CD Workflows Against Tampering',
    category: 'fs',
    priority: 960,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      // Determine if this is a write/tamper operation
      const isWriteTool = WRITE_TOOL_NAME_PATTERN.test(ctx.toolName);
      if (!isWriteTool && !blockAll) {
        return null;
      }

      if (!ctx.params || typeof ctx.params !== 'object') {
        return null;
      }

      for (const field of pathFields) {
        const val = ctx.params[field];
        if (typeof val === 'string' && val.trim() !== '') {
          const inspection = inspectGitCIPath(val);
          if (inspection.isProtected) {
            return {
              ruleId: 'fs-protect-git-and-ci-configs',
              ruleName: 'Protect Git Internals and CI/CD Workflows Against Tampering',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: `Unauthorized modification to repository/CI infrastructure intercepted: ${inspection.reason}`,
            };
          }
        }
      }

      return null;
    },
  };
}

export const gitCIProtectionRule: SentinelRule = createGitCIProtectionRule();
