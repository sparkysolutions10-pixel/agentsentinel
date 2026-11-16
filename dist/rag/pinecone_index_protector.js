/**
 * AgentSentinel - Pinecone Index Deletion and Vector Wipe Protector.
 * Intercepts and strictly prevents catastrophic deletion of entire vector indexes
 * (e.g. `deleteIndex`, `delete_index`, `deleteAll: true`, `dropCollection`)
 * by autonomous AI agents.
 */
import { Verdict } from '../types.js';
const DESTRUCTIVE_TOOL_PATTERNS = [
    /(?:^|[_.:])delete[_-]?index/i,
    /(?:^|[_.:])drop[_-]?index/i,
    /(?:^|[_.:])wipe[_-]?index/i,
    /(?:^|[_.:])delete[_-]?collection/i,
    /(?:^|[_.:])drop[_-]?collection/i,
];
/**
 * Inspects a tool call to detect index drops or vector wipe operations.
 */
export function inspectIndexDeletion(toolName, params = {}, options = {}) {
    const targetIndex = params.indexName ??
        params.index ??
        params.name ??
        params.collection ??
        params.collectionName ??
        params.target;
    // 1. Check if tool name is explicitly an index deletion tool
    for (const pat of DESTRUCTIVE_TOOL_PATTERNS) {
        if (pat.test(toolName)) {
            if (options.protectedIndices &&
                targetIndex &&
                !options.protectedIndices.includes(targetIndex)) {
                // Index is not in protected list
                return { isDestructiveDeletion: false };
            }
            return {
                isDestructiveDeletion: true,
                targetIndex: targetIndex ? String(targetIndex) : undefined,
                operation: toolName,
                reason: `Destructive index drop operation intercepted: "${toolName}" targeting index "${targetIndex || 'unspecified'}". Entire vector store destruction is prohibited.`,
            };
        }
    }
    // 2. Check for deleteAll parameter in query / mutation tools
    const deleteAllVal = params.deleteAll ?? params.delete_all;
    if (deleteAllVal === true ||
        deleteAllVal === 1 ||
        (typeof deleteAllVal === 'string' && /^(?:true|1|all)$/i.test(deleteAllVal.trim()))) {
        return {
            isDestructiveDeletion: true,
            targetIndex: targetIndex ? String(targetIndex) : undefined,
            operation: 'deleteAll',
            reason: `Unconstrained vector wipe ("deleteAll: true") intercepted. Wiping all vectors in namespace/index "${targetIndex || 'current'}" is prohibited.`,
        };
    }
    return { isDestructiveDeletion: false };
}
/**
 * Creates SentinelRule to guard Pinecone index lifecycles.
 */
export function createPineconeIndexProtectorRule(options = {}) {
    const useConfirm = options.requireConfirmation ?? false;
    return {
        id: 'rag-pinecone-index-protector',
        name: 'Block Destructive Vector Index Drops and Bulk Wipes',
        category: 'network',
        priority: 950,
        enabled: true,
        evaluate: (ctx) => {
            const inspection = inspectIndexDeletion(ctx.toolName, ctx.params, options);
            if (inspection.isDestructiveDeletion) {
                if (useConfirm) {
                    return {
                        ruleId: 'rag-pinecone-index-protector',
                        ruleName: 'Block Destructive Vector Index Drops and Bulk Wipes',
                        severity: 'critical',
                        verdict: Verdict.CONFIRM,
                        reason: `${inspection.reason || 'Destructive vector index deletion'} (Requires interactive confirmation).`,
                        detectedPattern: inspection.operation,
                    };
                }
                return {
                    ruleId: 'rag-pinecone-index-protector',
                    ruleName: 'Block Destructive Vector Index Drops and Bulk Wipes',
                    severity: 'critical',
                    verdict: Verdict.BLOCK,
                    reason: inspection.reason || 'Destructive vector index deletion prohibited by enterprise policy.',
                    detectedPattern: inspection.operation,
                };
            }
            return null;
        },
    };
}
export const pineconeIndexProtectorRule = createPineconeIndexProtectorRule();
//# sourceMappingURL=pinecone_index_protector.js.map