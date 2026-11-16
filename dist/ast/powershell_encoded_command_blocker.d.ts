/**
 * Auto-generated Enterprise Security Invariant: Issue #1886
 * Title: feat(ast): implement AST detector decoding and auditing PowerShell -EncodedCommand payloads
 */
export declare class PowershellEncodedCommandBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=powershell_encoded_command_blocker.d.ts.map