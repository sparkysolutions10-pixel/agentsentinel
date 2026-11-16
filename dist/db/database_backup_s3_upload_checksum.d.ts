/**
 * Auto-generated Enterprise Security Invariant: Issue #1937
 * Title: feat(db): implement automated SHA-256 validation on database snapshot backup archives
 */
export declare class DatabaseBackupS3UploadChecksum {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=database_backup_s3_upload_checksum.d.ts.map