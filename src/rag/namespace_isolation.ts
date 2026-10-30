/**
 * AgentSentinel - RAG Multi-Tenant Namespace Isolation Guard.
 * Enforces strict tenant boundary isolation across Pinecone namespaces and vector collections.
 * Prevents prompt-injected agents from querying or writing to unauthorized tenant partitions.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface NamespaceIsolationOptions {
  /**
   * Static list of allowed namespaces for the agent/environment.
   */
  allowedNamespaces?: string[];
  /**
   * Dynamic tenant resolver mapping agent ID or context to permitted namespaces.
   */
  resolveAllowedNamespaces?: (ctx: ToolCallContext) => string[] | Promise<string[]>;
  /**
   * Whether to strictly block queries with empty or undefined namespaces.
   * Default: true (forces explicit tenant isolation).
   */
  blockEmptyNamespace?: boolean;
  /**
   * Block wildcard, regex, or special administrative namespace identifiers.
   * Default: true.
   */
  blockWildcardNamespace?: boolean;
}

export interface NamespaceInspectionResult {
  isAllowed: boolean;
  targetNamespace?: string;
  reason?: string;
}

const WILDCARD_NAMESPACE_PATTERNS = [
  /^\*$/,
  /^\.\*$/,
  /^__all__$/i,
  /^__admin__$/i,
  /^all_tenants$/i,
  /%\w+%/i, // SQL-style wildcards in namespace
];

/**
 * Inspects a requested vector namespace against allowed tenant boundaries.
 */
export function inspectNamespaceBoundary(
  requestedNamespace: string | undefined | null,
  allowedNamespaces: string[] = [],
  options: NamespaceIsolationOptions = {}
): NamespaceInspectionResult {
  const blockEmpty = options.blockEmptyNamespace ?? true;
  const blockWildcard = options.blockWildcardNamespace ?? true;

  // 1. Empty or undefined namespace check
  if (!requestedNamespace || requestedNamespace.trim() === '') {
    if (blockEmpty && allowedNamespaces.length > 0) {
      return {
        isAllowed: false,
        targetNamespace: '',
        reason: 'Empty or undefined vector namespace is prohibited. An explicit tenant namespace must be specified.',
      };
    }
    return { isAllowed: true, targetNamespace: '' };
  }

  const cleanNs = requestedNamespace.trim();

  // 2. Wildcard or admin namespace bypass check
  if (blockWildcard) {
    for (const pat of WILDCARD_NAMESPACE_PATTERNS) {
      if (pat.test(cleanNs)) {
        return {
          isAllowed: false,
          targetNamespace: cleanNs,
          reason: `Wildcard or administrative namespace "${cleanNs}" is prohibited. Multi-tenant bypass attempt intercepted.`,
        };
      }
    }
  }

  // 3. Allowed namespace verification
  if (allowedNamespaces.length > 0 && !allowedNamespaces.includes(cleanNs)) {
    return {
      isAllowed: false,
      targetNamespace: cleanNs,
      reason: `Unauthorized namespace "${cleanNs}". Tenant boundary violation: Access permitted only to [${allowedNamespaces.join(', ')}].`,
    };
  }

  return { isAllowed: true, targetNamespace: cleanNs };
}

/**
 * Creates SentinelRule to enforce vector namespace isolation.
 */
export function createNamespaceIsolationGuardRule(
  options: NamespaceIsolationOptions = {}
): SentinelRule {
  const staticAllowed = options.allowedNamespaces || [];

  return {
    id: 'rag-namespace-isolation-guard',
    name: 'Enforce Multi-Tenant Vector Namespace Isolation',
    category: 'network',
    priority: 925,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      if (!ctx.params || typeof ctx.params !== 'object') {
        return null;
      }

      // Check if this tool call involves namespace or collection
      const hasNamespaceParam =
        ctx.params.namespace !== undefined ||
        ctx.params.tenantId !== undefined ||
        ctx.params.tenant_id !== undefined ||
        ctx.params.collection !== undefined;

      const isVectorTool =
        /(?:pinecone|vector|chroma|qdrant|embedding|rag)/i.test(ctx.toolName);

      if (!hasNamespaceParam && !isVectorTool) {
        return null;
      }

      const reqNamespace =
        ctx.params.namespace ??
        ctx.params.tenantId ??
        ctx.params.tenant_id ??
        ctx.params.collection;

      let allowed = staticAllowed;
      if (options.resolveAllowedNamespaces) {
        const resolved = options.resolveAllowedNamespaces(ctx);
        if (Array.isArray(resolved)) {
          allowed = resolved;
        }
      }

      const inspection = inspectNamespaceBoundary(reqNamespace, allowed, options);
      if (!inspection.isAllowed) {
        return {
          ruleId: 'rag-namespace-isolation-guard',
          ruleName: 'Enforce Multi-Tenant Vector Namespace Isolation',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: inspection.reason || 'Vector namespace isolation boundary violated.',
          detectedPattern: `namespace=${inspection.targetNamespace}`,
        };
      }

      return null;
    },
  };
}

export const defaultNamespaceIsolationRule: SentinelRule = createNamespaceIsolationGuardRule();
