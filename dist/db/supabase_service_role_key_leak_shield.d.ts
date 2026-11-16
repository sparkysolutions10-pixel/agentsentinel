/**
 * Auto-generated Enterprise Security Invariant: Issue #1943
 * Title: feat(db): implement API response scrubber halting exposure of Supabase service_role keys
 */
export declare class SupabaseServiceRoleKeyLeakShield {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=supabase_service_role_key_leak_shield.d.ts.map