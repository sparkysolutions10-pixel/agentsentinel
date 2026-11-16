/**
 * Auto-generated Enterprise Security Invariant: Issue #1767
 * Title: feat(web3): implement calldata boundary validator preventing buffer overflow exploits
 */
export declare class EvmCalldataFuzzInterceptor {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=evm_calldata_fuzz_interceptor.d.ts.map