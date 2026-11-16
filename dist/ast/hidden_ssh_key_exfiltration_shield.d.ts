/**
 * Auto-generated Enterprise Security Invariant: Issue #1862
 * Title: feat(ast): implement file read boundary blocker on ~/.ssh/id_rsa and known_hosts
 */
export declare class HiddenSshKeyExfiltrationShield {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=hidden_ssh_key_exfiltration_shield.d.ts.map