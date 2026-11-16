/**
 * Auto-generated Enterprise Security Invariant: Issue #1856
 * Title: feat(ast): implement AST detector preventing direct writes to /dev/sd* and /dev/nvme* devices
 */
export declare class DiskWipeBlockDeviceGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=disk_wipe_block_device_guard.d.ts.map