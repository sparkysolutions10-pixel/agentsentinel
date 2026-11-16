/**
 * Auto-generated Enterprise Security Invariant: Issue #1874
 * Title: feat(ast): implement AST detector preventing mkfs.ext4 and format commands on active disks
 */
export declare class MkfsFilesystemFormatBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=mkfs_filesystem_format_blocker.d.ts.map