/**
 * PolicyDiffAuditor - Audits diffs between security policy versions.
 */
export interface RuleDefinition {
    id: string;
    action: 'allow' | 'block' | 'confirm';
    tools?: string[];
}
export interface PolicyDiff {
    addedRules: string[];
    removedRules: string[];
    modifiedRules: Array<{
        id: string;
        oldAction: string;
        newAction: string;
    }>;
    isRelaxed: boolean;
}
export declare class PolicyDiffAuditor {
    static compare(oldRules: RuleDefinition[], newRules: RuleDefinition[]): PolicyDiff;
}
//# sourceMappingURL=policy_diff_auditor.d.ts.map