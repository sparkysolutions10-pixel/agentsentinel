import { Verdict } from '../types.js';
export function inspectMilvusPartition(params) {
    if (!params)
        return { isValid: true };
    const partitionName = params.partition_name ?? params.partitionName ?? params.partition;
    if (!partitionName || (typeof partitionName === 'string' && partitionName.trim().length === 0)) {
        return { isValid: false, reason: 'Milvus vector operations must explicitly specify a partition key for multi-tenant isolation.' };
    }
    return { isValid: true };
}
export function createMilvusPartitionKeyEnforcerRule(options = {}) {
    return {
        id: 'rag-milvus-partition-enforcer',
        name: 'Enforce Explicit Milvus Partition Keys for Multi-Tenant Isolation',
        category: 'custom',
        priority: 940,
        enabled: true,
        evaluate: (ctx) => {
            const isMilvus = ctx.toolName.toLowerCase().includes('milvus') || ctx.params?.client === 'milvus';
            if (!isMilvus)
                return null;
            const isReadWrite = ctx.toolName.includes('query') || ctx.toolName.includes('search') || ctx.toolName.includes('insert');
            if (!isReadWrite)
                return null;
            const inspection = inspectMilvusPartition(ctx.params);
            if (!inspection.isValid) {
                return {
                    ruleId: 'rag-milvus-partition-enforcer',
                    ruleName: 'Enforce Explicit Milvus Partition Keys for Multi-Tenant Isolation',
                    severity: 'high',
                    verdict: Verdict.BLOCK,
                    reason: inspection.reason || 'Missing required partition key.',
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=milvus_partition_enforcer.js.map