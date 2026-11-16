/**
 * AgentSentinel - Storage Footprint Diff Auditor
 * Audits pre-execution vs post-execution storage deltas to identify unexpected
 * state mutations and unpermitted key overwrites.
 */
export class StorageFootprintDiffAuditor {
    static computeDiff(preState, postState) {
        const created = [];
        const modified = [];
        const deleted = [];
        let bytesDelta = 0;
        for (const [key, postVal] of Object.entries(postState)) {
            if (!(key in preState)) {
                created.push(key);
                bytesDelta += Buffer.byteLength(postVal, 'utf-8');
            }
            else if (preState[key] !== postVal) {
                modified.push(key);
                bytesDelta += Buffer.byteLength(postVal, 'utf-8') - Buffer.byteLength(preState[key], 'utf-8');
            }
        }
        for (const key of Object.keys(preState)) {
            if (!(key in postState)) {
                deleted.push(key);
                bytesDelta -= Buffer.byteLength(preState[key], 'utf-8');
            }
        }
        return {
            createdKeys: created,
            modifiedKeys: modified,
            deletedKeys: deleted,
            totalBytesDelta: bytesDelta
        };
    }
}
//# sourceMappingURL=storage_diff_auditor.js.map