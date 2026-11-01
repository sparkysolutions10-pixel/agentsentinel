/**
 * AgentSentinel - ChromaDB Local Storage Directory Traversal Protector Rule.
 * Ensures ChromaDB persist directory remains strictly confined within the allowed workspace boundary.
 */

import path from 'path';
import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface ChromaStorageGuardOptions {
  allowedWorkspaceRoot?: string;
}

export function inspectChromaStoragePath(
  targetPath: string,
  allowedWorkspaceRoot?: string
): { isValid: boolean; violationReason?: string } {
  if (!targetPath || typeof targetPath !== 'string') {
    return { isValid: true };
  }

  // Detect path traversal tokens
  if (targetPath.includes('..') || targetPath.includes('\0')) {
    return {
      isValid: false,
      violationReason: `Path traversal pattern detected in persist directory: "${targetPath}".`,
    };
  }

  // Detect system root targets
  const normalized = path.normalize(targetPath);
  if (normalized === '/' || normalized === '\\' || /^[a-zA-Z]:\\?$/.test(normalized)) {
    return {
      isValid: false,
      violationReason: `Root filesystem path detected as ChromaDB persist directory: "${targetPath}".`,
    };
  }

  if (allowedWorkspaceRoot) {
    const resolvedRoot = path.resolve(allowedWorkspaceRoot);
    const resolvedTarget = path.resolve(allowedWorkspaceRoot, targetPath);
    if (!resolvedTarget.startsWith(resolvedRoot)) {
      return {
        isValid: false,
        violationReason: `Persist directory "${targetPath}" escapes allowed workspace jail boundary.`,
      };
    }
  }

  return { isValid: true };
}

export function createChromaStorageDirectoryGuardRule(
  options: ChromaStorageGuardOptions = {}
): SentinelRule {
  return {
    id: 'rag-chroma-storage-guard',
    name: 'Confine ChromaDB Persistence Storage to Workspace Jail',
    category: 'fs',
    priority: 950,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const persistDir =
        ctx.params?.persist_directory ??
        ctx.params?.persistDirectory ??
        ctx.params?.path ??
        ctx.params?.db_path;

      if (persistDir && typeof persistDir === 'string') {
        const inspection = inspectChromaStoragePath(persistDir, options.allowedWorkspaceRoot);
        if (!inspection.isValid) {
          return {
            ruleId: 'rag-chroma-storage-guard',
            ruleName: 'Confine ChromaDB Persistence Storage to Workspace Jail',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: inspection.violationReason || 'Storage directory traversal detected.',
            detectedPattern: persistDir,
          };
        }
      }

      return null;
    },
  };
}

export const chromaStorageDirectoryGuardRule: SentinelRule = createChromaStorageDirectoryGuardRule();
