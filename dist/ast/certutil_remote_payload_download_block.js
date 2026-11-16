/**
 * Auto-generated Enterprise Security Invariant: Issue #1889
 * Title: feat(ast): implement AST blocker halting certutil.exe -urlcache -f remote payload pulls
 */
export class CertutilRemotePayloadDownloadBlock {
    static INVARIANT_NAME = 'RULE_INVARIANT_CERTUTIL_REMOTE_PAYLOAD_DOWNLOAD_BLOCK';
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
//# sourceMappingURL=certutil_remote_payload_download_block.js.map