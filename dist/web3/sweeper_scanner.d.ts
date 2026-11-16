export declare class SweeperBytecodeScanner {
    private static readonly KNOWN_SWEEPER_BYTECODE_SIGNATURES;
    static isSweeperContract(bytecode: string): boolean;
    static auditDelegationBytecode(targetAddress: string, bytecode: string): {
        isThreat: boolean;
        action: string;
    };
}
//# sourceMappingURL=sweeper_scanner.d.ts.map