/**
 * Auto-generated Enterprise Security Invariant: Issue #1915
 * Title: feat(db): implement partition key presence validator on high-concurrency Milvus inserts
 */
export declare class MilvusPartitionKeyValidator {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=milvus_partition_key_validator.d.ts.map