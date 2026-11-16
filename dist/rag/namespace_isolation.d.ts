/**
 * AgentSentinel - RAG Multi-Tenant Namespace Isolation Guard.
 * Enforces strict tenant boundary isolation across Pinecone namespaces and vector collections.
 * Prevents prompt-injected agents from querying or writing to unauthorized tenant partitions.
 */
import { SentinelRule, ToolCallContext } from '../types.js';
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
/**
 * Inspects a requested vector namespace against allowed tenant boundaries.
 */
export declare function inspectNamespaceBoundary(requestedNamespace: string | undefined | null, allowedNamespaces?: string[], options?: NamespaceIsolationOptions): NamespaceInspectionResult;
/**
 * Creates SentinelRule to enforce vector namespace isolation.
 */
export declare function createNamespaceIsolationGuardRule(options?: NamespaceIsolationOptions): SentinelRule;
export declare const defaultNamespaceIsolationRule: SentinelRule;
//# sourceMappingURL=namespace_isolation.d.ts.map