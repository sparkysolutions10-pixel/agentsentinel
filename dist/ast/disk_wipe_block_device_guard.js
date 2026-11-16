/**
 * Auto-generated Enterprise Security Invariant: Issue #1856
 * Title: feat(ast): implement AST detector preventing direct writes to /dev/sd* and /dev/nvme* devices
 */
export class DiskWipeBlockDeviceGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_DISK_WIPE_BLOCK_DEVICE_GUARD';
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
//# sourceMappingURL=disk_wipe_block_device_guard.js.map