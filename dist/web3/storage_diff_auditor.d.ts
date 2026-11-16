/**
 * AgentSentinel - Storage Footprint Diff Auditor
 * Audits pre-execution vs post-execution storage deltas to identify unexpected
 * state mutations and unpermitted key overwrites.
 */
export interface StorageDelta {
    createdKeys: string[];
    modifiedKeys: string[];
    deletedKeys: string[];
    totalBytesDelta: number;
}
export declare class StorageFootprintDiffAuditor {
    static computeDiff(preState: Record<string, string>, postState: Record<string, string>): StorageDelta;
}
//# sourceMappingURL=storage_diff_auditor.d.ts.map