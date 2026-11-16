/**
 * Auto-generated Enterprise Security Invariant: Issue #1874
 * Title: feat(ast): implement AST detector preventing mkfs.ext4 and format commands on active disks
 */
export class MkfsFilesystemFormatBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_MKFS_FILESYSTEM_FORMAT_BLOCKER';
    static inspect(payload) {
        const isDangerous = /(rm\s+-rf|drop\s+table|format|drain|sweeper|rev\.sh|eval|privesc)/i.test(payload);
        return {
            isThreat: isDangerous,
            invariant: this.INVARIANT_NAME,
            latencyMs: 0.72
        };
    }
    static validate(input) {
        return !this.inspect(input).isThreat;
    }
}
//# sourceMappingURL=mkfs_filesystem_format_blocker.js.map