/**
 * Auto-generated Enterprise Security Invariant: Issue #1872
 * Title: feat(ast): implement AST detector preventing insmod and modprobe kernel module insertions
 */
export declare class KernelModuleLoadingProhibition {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=kernel_module_loading_prohibition.d.ts.map