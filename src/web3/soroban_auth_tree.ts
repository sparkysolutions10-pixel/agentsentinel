/**
 * AgentSentinel - Soroban Authorization Tree (SorobanAuthorizationEntry) Verifier
 * Validates sub-contract invocation authorization trees, verifying that authorized
 * credentials exist for each leaf and sub-call to prevent unauthorized contract execution.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanAuthTreeConfig {
  disallowUnsignedSubInvocations?: boolean;
  maxAuthTreeDepth?: number;
}

export interface AuthEntry {
  credentials?: {
    type?: string;
    address?: string;
    signature?: string;
  };
  rootInvocation?: {
    function?: string;
    subInvocations?: AuthEntry[];
  };
}

export function createSorobanAuthTreeVerifierRule(config: SorobanAuthTreeConfig = {}): SentinelRule {
  const disallowUnsigned = config.disallowUnsignedSubInvocations ?? true;
  const maxDepth = config.maxAuthTreeDepth ?? 6;

  function validateNode(node: any, depth: number): string | null {
    if (depth > maxDepth) {
      return `Authorization tree depth (${depth}) exceeds maximum limit (${maxDepth})`;
    }

    if (disallowUnsigned) {
      const creds = node?.credentials;
      if (!creds || (!creds.signature && !creds.address && creds.type !== 'source_account')) {
        return `Missing authorization credentials for invocation node: ${node?.function || 'anonymous'}`;
      }
    }

    if (Array.isArray(node?.subInvocations)) {
      for (const sub of node.subInvocations) {
        const err = validateNode(sub, depth + 1);
        if (err) return err;
      }
    }

    return null;
  }

  return {
    id: 'soroban-auth-tree-verifier',
    name: 'Soroban Authorization Tree Verifier',
    category: 'custom' as ToolCategory,
    priority: 80,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('contract')) {
        return null;
      }

      const params = context.params || {};
      const authEntries = params.auth || params.authEntries || params.authorizations;

      if (Array.isArray(authEntries)) {
        for (const entry of authEntries) {
          const err = validateNode(entry, 1);
          if (err) {
            return {
              ruleId: 'soroban-auth-tree-verifier',
              ruleName: 'Soroban Authorization Tree Verifier',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: `Soroban authorization tree verification failed: ${err}.`,
              detectedPattern: `AUTH_TREE_VIOLATION:${err}`,
            };
          }
        }
      }

      return null;
    }
  };
}
