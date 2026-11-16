/**
 * Auto-generated Enterprise Security Invariant: Issue #1928
 * Title: feat(db): implement DDL guard prohibiting ALTER USER WITH SUPERUSER commands
 */
export declare class DatabaseSuperuserRoleEscalationBlock {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=database_superuser_role_escalation_block.d.ts.map