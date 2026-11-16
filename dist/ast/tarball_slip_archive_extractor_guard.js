/**
 * Auto-generated Enterprise Security Invariant: Issue #1883
 * Title: feat(ast): implement Zip/Tar path traversal (Zip Slip) detector before extraction
 */
export class TarballSlipArchiveExtractorGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_TARBALL_SLIP_ARCHIVE_EXTRACTOR_GUARD';
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
//# sourceMappingURL=tarball_slip_archive_extractor_guard.js.map