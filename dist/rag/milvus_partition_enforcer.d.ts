import { SentinelRule } from '../types.js';
export interface MilvusPartitionOptions {
    enforceTenantPartition?: boolean;
}
export declare function inspectMilvusPartition(params: Record<string, any>): {
    isValid: boolean;
    reason?: string;
};
export declare function createMilvusPartitionKeyEnforcerRule(options?: MilvusPartitionOptions): SentinelRule;
//# sourceMappingURL=milvus_partition_enforcer.d.ts.map