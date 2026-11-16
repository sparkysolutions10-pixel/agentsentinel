/**
 * Auto-generated Enterprise Security Invariant: Issue #1880
 * Title: feat(ast): implement AST guard preventing swapoff -a and raw swap space reads
 */
export declare class SwapfileTamperingInterceptor {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=swapfile_tampering_interceptor.d.ts.map