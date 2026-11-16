/**
 * PolicyDiffAuditor - Audits diffs between security policy versions.
 */
export class PolicyDiffAuditor {
    static compare(oldRules, newRules) {
        const oldMap = new Map(oldRules.map(r => [r.id, r]));
        const newMap = new Map(newRules.map(r => [r.id, r]));
        const addedRules = newRules.filter(r => !oldMap.has(r.id)).map(r => r.id);
        const removedRules = oldRules.filter(r => !newMap.has(r.id)).map(r => r.id);
        const modifiedRules = [];
        let isRelaxed = false;
        for (const [id, oldR] of oldMap.entries()) {
            const newR = newMap.get(id);
            if (newR && newR.action !== oldR.action) {
                modifiedRules.push({ id, oldAction: oldR.action, newAction: newR.action });
                if (oldR.action === 'block' && newR.action === 'allow') {
                    isRelaxed = true;
                }
            }
        }
        return {
            addedRules,
            removedRules,
            modifiedRules,
            isRelaxed
        };
    }
}
//# sourceMappingURL=policy_diff_auditor.js.map