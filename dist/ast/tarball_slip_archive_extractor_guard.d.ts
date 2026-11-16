/**
 * Auto-generated Enterprise Security Invariant: Issue #1883
 * Title: feat(ast): implement Zip/Tar path traversal (Zip Slip) detector before extraction
 */
export declare class TarballSlipArchiveExtractorGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=tarball_slip_archive_extractor_guard.d.ts.map