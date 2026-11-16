/**
 * Auto-generated Enterprise Security Invariant: Issue #1889
 * Title: feat(ast): implement AST blocker halting certutil.exe -urlcache -f remote payload pulls
 */
export declare class CertutilRemotePayloadDownloadBlock {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=certutil_remote_payload_download_block.d.ts.map